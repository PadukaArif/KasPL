import assert from 'node:assert';

export function assertValidPublicId(publicId: string, prefix: string) {
  assert.ok(typeof publicId === 'string', 'publicId should be a string');
  assert.ok(publicId.startsWith(prefix), `publicId should start with prefix ${prefix}, got ${publicId}`);
}

export function assertNumberEquals(actual: number, expected: number, message?: string) {
  assert.strictEqual(actual, expected, message || `Expected ${expected}, got ${actual}`);
}

export function cloneFixture<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
