import mongoose from 'mongoose';

/**
 * Checks whether a given value is a valid 24-character hexadecimal MongoDB ObjectId string.
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Sanitizes input string to prevent unexpected injections or control characters.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case '\0': return '\\0';
      case '\x08': return '\\b';
      case '\x09': return '\\t';
      case '\x1a': return '\\z';
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '"': return '\"';
      case "'": return "\'";
      case '\\': return '\\\\';
      case '%': return '\\%';
      default: return char;
    }
  });
}
