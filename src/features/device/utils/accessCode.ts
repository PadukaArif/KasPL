import crypto from 'crypto';

const DEFAULT_SECRET = process.env.DEVICE_AUTH_SECRET || process.env.JWT_SECRET || 'kaspl-secret-key-2026-device-security-32b';

/**
 * Returns today's date in YYYY-MM-DD format based on local time.
 */
export function getTodayDateString(d = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generates a cryptographically secure random access code.
 * Requirements: 8-12 characters, uppercase, lowercase, numbers.
 */
export function generateAccessCode(length: number = 10): string {
  if (length < 8) length = 8;
  if (length > 12) length = 12;

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const allChars = uppercaseChars + lowercaseChars + numberChars;

  const codeChars: string[] = [];

  // Guarantee at least 1 of each required character type
  codeChars.push(uppercaseChars[crypto.randomInt(0, uppercaseChars.length)]);
  codeChars.push(lowercaseChars[crypto.randomInt(0, lowercaseChars.length)]);
  codeChars.push(numberChars[crypto.randomInt(0, numberChars.length)]);

  // Fill remaining characters
  while (codeChars.length < length) {
    codeChars.push(allChars[crypto.randomInt(0, allChars.length)]);
  }

  // Fisher-Yates Shuffle using crypto.randomInt
  for (let i = codeChars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = codeChars[i];
    codeChars[i] = codeChars[j];
    codeChars[j] = temp;
  }

  return codeChars.join('');
}

/**
 * Hashes an access code using SHA-256 for secure DB matching.
 */
export function hashAccessCode(code: string, salt: string = 'kaspl-salt-v1'): string {
  const normalized = code.trim();
  return crypto.createHmac('sha256', salt).update(normalized).digest('hex');
}

/**
 * Encrypts plaintext code using AES-256-GCM for encrypted storage (admin retrieval).
 */
export function encryptCode(plainText: string, secretKey = DEFAULT_SECRET): string {
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts encrypted code string.
 */
export function decryptCode(encryptedData: string, secretKey = DEFAULT_SECRET): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return '';

    const [ivHex, authTagHex, encryptedHex] = parts;
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    return '';
  }
}

/**
 * Parses userAgent into browser and platform string.
 */
export function parseDeviceInfo(userAgent: string, platformHint?: string) {
  let browser = 'Unknown Browser';
  let platform = platformHint || 'Unknown OS';

  const ua = userAgent || '';

  if (ua.includes('Firefox/')) {
    browser = 'Firefox';
  } else if (ua.includes('Edg/')) {
    browser = 'Edge';
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
  } else if (ua.includes('Safari/')) {
    browser = 'Safari';
  } else if (ua.includes('Opera') || ua.includes('OPR/')) {
    browser = 'Opera';
  }

  if (ua.includes('Windows')) {
    platform = 'Windows';
  } else if (ua.includes('Android')) {
    platform = 'Android';
  } else if (ua.includes('iPhone') || ua.includes('iPad')) {
    platform = 'iOS';
  } else if (ua.includes('Mac OS')) {
    platform = 'macOS';
  } else if (ua.includes('Linux')) {
    platform = 'Linux';
  }

  const deviceName = `${platform} (${browser})`;

  return { browser, platform, deviceName };
}
