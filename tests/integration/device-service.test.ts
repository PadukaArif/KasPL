import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DeviceServiceError } from '../../src/features/device/services/device.service';
import {
  generateAccessCode,
  hashAccessCode,
  encryptCode,
  decryptCode,
  getTodayDateString,
  parseDeviceInfo,
} from '../../src/features/device/utils/accessCode';

describe('Integration Tests: Device Authorization & Binding Workflows', () => {
  test('Access code generator and encryptor contract verification', () => {
    const rawCode = generateAccessCode(10);
    assert.equal(rawCode.length, 10);

    const hash = hashAccessCode(rawCode);
    assert.equal(hash.length, 64);

    const encrypted = encryptCode(rawCode);
    const decrypted = decryptCode(encrypted);
    assert.equal(decrypted, rawCode);
  });

  test('Device info parsing and userAgent detection', () => {
    const mobileUA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    const parsed = parseDeviceInfo(mobileUA);

    assert.equal(parsed.browser, 'Chrome');
    assert.equal(parsed.platform, 'Android');
    assert.equal(parsed.deviceName, 'Android (Chrome)');
  });

  test('DeviceServiceError properties and exception contract', () => {
    const err = new DeviceServiceError('Kode akses salah 5 kali', 'MAX_ATTEMPTS_EXCEEDED', 429);

    assert.equal(err.message, 'Kode akses salah 5 kali');
    assert.equal(err.code, 'MAX_ATTEMPTS_EXCEEDED');
    assert.equal(err.statusCode, 429);
    assert.equal(err.name, 'DeviceServiceError');
    assert.ok(err instanceof Error);
  });

  test('Access Code Date string formatting contract', () => {
    const dateStr = getTodayDateString();
    assert.match(dateStr, /^\d{4}-\d{2}-\d{2}$/);
  });
});
