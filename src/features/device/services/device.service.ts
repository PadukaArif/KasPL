import connectToDatabase from '@/lib/db/mongodb';
import { AuthorizedDevice, IAuthorizedDevice } from '../models/authorizedDevice.model';
import { DailyAccessCode } from '../models/dailyAccessCode.model';
import { AccessCodeAttempt } from '../models/accessCodeAttempt.model';
import {
  generateAccessCode,
  hashAccessCode,
  encryptCode,
  decryptCode,
  getTodayDateString,
  parseDeviceInfo,
} from '../utils/accessCode';
import crypto from 'crypto';

export class DeviceServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'DeviceServiceError';
    Object.setPrototypeOf(this, DeviceServiceError.prototype);
  }
}

export interface VerifyBindPayload {
  code: string;
  deviceId: string;
  userAgent: string;
  platform?: string;
  ipAddress?: string;
}

export class DeviceService {
  /**
   * Returns today's end of day date (23:59:59.999).
   */
  private static getEndOfToday(): Date {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Retrieves or automatically generates today's access code.
   */
  public static async getOrGenerateTodayAccessCode(): Promise<{
    rawCode: string;
    dateStr: string;
    createdAt: Date;
    expiresAt: Date;
    isUsed: boolean;
  }> {
    await connectToDatabase();
    const todayStr = getTodayDateString();

    // Check existing unused code for today
    const existingCodeDoc = await DailyAccessCode.findOne({
      dateStr: todayStr,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (existingCodeDoc) {
      const rawCode = decryptCode(existingCodeDoc.encryptedCode);
      if (rawCode) {
        return {
          rawCode,
          dateStr: existingCodeDoc.dateStr,
          createdAt: existingCodeDoc.createdAt,
          expiresAt: existingCodeDoc.expiresAt,
          isUsed: existingCodeDoc.isUsed,
        };
      }
    }

    // Generate a fresh code if none exists or invalid
    return await DeviceService.generateNewAccessCodeForToday();
  }

  /**
   * Explicitly generates a new access code for today (Admin action or auto-generation).
   */
  public static async generateNewAccessCodeForToday(): Promise<{
    rawCode: string;
    dateStr: string;
    createdAt: Date;
    expiresAt: Date;
    isUsed: boolean;
  }> {
    await connectToDatabase();
    const todayStr = getTodayDateString();
    const rawCode = generateAccessCode(10);
    const codeHash = hashAccessCode(rawCode);
    const encryptedCode = encryptCode(rawCode);
    const expiresAt = DeviceService.getEndOfToday();

    // Invalidate any previously unused codes for today
    await DailyAccessCode.updateMany(
      { dateStr: todayStr, isUsed: false },
      { $set: { expiresAt: new Date() } }
    );

    const newCodeDoc = await DailyAccessCode.create({
      codeHash,
      encryptedCode,
      dateStr: todayStr,
      isUsed: false,
      createdAt: new Date(),
      expiresAt,
    });

    return {
      rawCode,
      dateStr: newCodeDoc.dateStr,
      createdAt: newCodeDoc.createdAt,
      expiresAt: newCodeDoc.expiresAt,
      isUsed: newCodeDoc.isUsed,
    };
  }

  /**
   * Verifies access code and binds device. Implements 5-attempt rate limit and 10-minute lockout.
   */
  public static async verifyAndBindDevice(payload: VerifyBindPayload): Promise<{
    deviceToken: string;
    deviceId: string;
    deviceName: string;
  }> {
    await connectToDatabase();

    const { code, deviceId, userAgent, platform: platformHint, ipAddress } = payload;

    if (!code || !code.trim()) {
      throw new DeviceServiceError('Kode akses tidak boleh kosong.', 'EMPTY_CODE', 400);
    }
    if (!deviceId || !deviceId.trim()) {
      throw new DeviceServiceError('Device ID tidak valid.', 'INVALID_DEVICE_ID', 400);
    }

    const rateLimitIdentifier = deviceId.trim();
    const now = new Date();

    // Check rate limit status
    let attemptRecord = await AccessCodeAttempt.findOne({ identifier: rateLimitIdentifier });

    if (attemptRecord && attemptRecord.lockedUntil) {
      if (attemptRecord.lockedUntil > now) {
        const minutesLeft = Math.ceil(
          (attemptRecord.lockedUntil.getTime() - now.getTime()) / (60 * 1000)
        );
        throw new DeviceServiceError(
          `Terlalu banyak percobaan gagal. Akses dikunci selama ${minutesLeft} menit lagi.`,
          'RATE_LIMITED',
          429
        );
      } else {
        // Lockout expired, reset attempts
        attemptRecord.failedAttempts = 0;
        attemptRecord.lockedUntil = undefined;
        await attemptRecord.save();
      }
    }

    const todayStr = getTodayDateString();
    const inputHash = hashAccessCode(code.trim());

    // Search active unused code
    const matchingCodeDoc = await DailyAccessCode.findOne({
      codeHash: inputHash,
      dateStr: todayStr,
      isUsed: false,
      expiresAt: { $gt: now },
    });

    if (!matchingCodeDoc) {
      // Record failed attempt
      if (!attemptRecord) {
        attemptRecord = new AccessCodeAttempt({
          identifier: rateLimitIdentifier,
          failedAttempts: 1,
          lastAttemptAt: now,
        });
      } else {
        attemptRecord.failedAttempts += 1;
        attemptRecord.lastAttemptAt = now;
      }

      if (attemptRecord.failedAttempts >= 5) {
        // Lock for 10 minutes
        attemptRecord.lockedUntil = new Date(now.getTime() + 10 * 60 * 1000);
        await attemptRecord.save();
        throw new DeviceServiceError(
          'Kode akses salah 5 kali. Perangkat dikunci selama 10 menit.',
          'MAX_ATTEMPTS_EXCEEDED',
          429
        );
      }

      await attemptRecord.save();
      const remaining = 5 - attemptRecord.failedAttempts;
      throw new DeviceServiceError(
        `Kode akses tidak valid atau sudah kadaluarsa. Sisa percobaan: ${remaining}`,
        'INVALID_CODE',
        400
      );
    }

    // Success! Reset attempts
    if (attemptRecord) {
      attemptRecord.failedAttempts = 0;
      attemptRecord.lockedUntil = undefined;
      await attemptRecord.save();
    }

    // Mark code as used
    matchingCodeDoc.isUsed = true;
    matchingCodeDoc.usedByDeviceId = deviceId;
    await matchingCodeDoc.save();

    // Create device token & information
    const deviceToken = crypto.randomBytes(32).toString('hex');
    const { browser, platform, deviceName } = parseDeviceInfo(userAgent, platformHint);

    let deviceDoc = await AuthorizedDevice.findOne({ deviceId });

    if (deviceDoc) {
      deviceDoc.deviceToken = deviceToken;
      deviceDoc.deviceName = deviceName;
      deviceDoc.browser = browser;
      deviceDoc.platform = platform;
      deviceDoc.userAgent = userAgent;
      deviceDoc.ipAddress = ipAddress;
      deviceDoc.lastActive = now;
      deviceDoc.isRevoked = false;
      deviceDoc.revokedAt = undefined;
      await deviceDoc.save();
    } else {
      deviceDoc = await AuthorizedDevice.create({
        deviceId,
        deviceToken,
        deviceName,
        browser,
        platform,
        userAgent,
        ipAddress,
        createdAt: now,
        lastActive: now,
        isRevoked: false,
      });
    }

    return {
      deviceToken,
      deviceId: deviceDoc.deviceId,
      deviceName: deviceDoc.deviceName,
    };
  }

  /**
   * Verifies if a given deviceToken corresponds to a valid, active, non-revoked device.
   */
  public static async verifyDeviceToken(deviceToken: string): Promise<IAuthorizedDevice | null> {
    if (!deviceToken || typeof deviceToken !== 'string') return null;

    await connectToDatabase();
    const device = await AuthorizedDevice.findOne({
      deviceToken,
      isRevoked: false,
    });

    if (!device) return null;

    // Update lastActive timestamp (fire and forget update)
    AuthorizedDevice.updateOne(
      { _id: device._id },
      { $set: { lastActive: new Date() } }
    ).catch(() => {});

    return device;
  }

  /**
   * Retrieves list of active / authorized devices for Admin Panel.
   */
  public static async getActiveDevices(): Promise<IAuthorizedDevice[]> {
    await connectToDatabase();
    return await AuthorizedDevice.find()
      .sort({ lastActive: -1 })
      .exec();
  }

  /**
   * Revokes a device's access.
   */
  public static async revokeDevice(deviceId: string): Promise<boolean> {
    if (!deviceId) return false;

    await connectToDatabase();
    const result = await AuthorizedDevice.updateOne(
      { deviceId },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      }
    );

    return result.modifiedCount > 0;
  }
}
