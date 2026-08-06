/**
 * Returns today's date in YYYY-MM-DD format using local time zone.
 */
export function getTodayBusinessDate(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
}
