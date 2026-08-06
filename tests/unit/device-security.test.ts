import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateAccessCode,
  hashAccessCode,
  encryptCode,
  decryptCode,
  getTodayDateString,
  parseDeviceInfo,
} from '../../src/features/device/utils/accessCode';

describe('Unit Tests: Device Security & Cryptography Utilities', () => {
  test('generateAccessCode should return random code meeting security requirements', () => {
    const code = generateAccessCode(10);

    assert.equal(code.length, 10);
    assert.match(code, /[A-Z]/, 'Code must contain at least one uppercase letter');
    assert.match(code, /[a-z]/, 'Code must contain at least one lowercase letter');
    assert.match(code, /[0-9]/, 'Code must contain at least one number');

    const secondCode = generateAccessCode(10);
    assert.notEqual(code, secondCode, 'Subsequent codes should be random and distinct');
  });

  test('hashAccessCode should produce consistent SHA-256 HMAC hash', () => {
    const code = 'K7x9M2pQ';
    const hash1 = hashAccessCode(code);
    const hash2 = hashAccessCode('  K7x9M2pQ ');

    assert.equal(typeof hash1, 'string');
    assert.equal(hash1.length, 64);
    assert.equal(hash1, hash2, 'Hash should normalize leading/trailing whitespace');
  });

  test('encryptCode and decryptCode should successfully roundtrip plaintext access codes', () => {
    const plainTextCode = 'A9b8C7d6';
    const encrypted = encryptCode(plainTextCode);

    assert.notEqual(encrypted, plainTextCode);
    assert.match(encrypted, /^.+:.+:.+$/, 'Encrypted string should have IV:AuthTag:Ciphertext format');

    const decrypted = decryptCode(encrypted);
    assert.equal(decrypted, plainTextCode);
  });

  test('decryptCode should return empty string for tampered or invalid ciphertext', () => {
    const invalidData = 'invalid:tampered:string';
    const result = decryptCode(invalidData);
    assert.equal(result, '');
  });

  test('getTodayDateString should return valid YYYY-MM-DD string', () => {
    const todayStr = getTodayDateString(new Date(2026, 7, 6)); // Aug 6, 2026
    assert.equal(todayStr, '2026-08-06');
  });

  test('parseDeviceInfo should identify browser and platform from userAgent string', () => {
    const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    const parsedChrome = parseDeviceInfo(chromeUA);
    assert.equal(parsedChrome.browser, 'Chrome');
    assert.equal(parsedChrome.platform, 'Windows');

    const androidUA = 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36';
    const parsedAndroid = parseDeviceInfo(androidUA);
    assert.equal(parsedAndroid.browser, 'Chrome');
    assert.equal(parsedAndroid.platform, 'Android');
  });
});
