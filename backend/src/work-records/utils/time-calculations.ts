/**
 * Time Calculation Utilities
 *
 * These utilities handle time conversion and hour calculation for work records,
 * including support for overnight shifts (shifts that span midnight).
 */

/**
 * Converts a time string in HH:MM:SS format to minutes since midnight.
 *
 * @param time - Time string in format "HH:MM:SS" (e.g., "09:30:00")
 * @returns Number of minutes since midnight (e.g., "09:30:00" returns 570)
 * @throws Error if time format is invalid
 *
 * @example
 * convertTimeToMinutes("09:30:00") // returns 570
 * convertTimeToMinutes("00:00:00") // returns 0
 * convertTimeToMinutes("23:59:59") // returns 1439
 */
export function convertTimeToMinutes(time: string): number {
  // Validate input format
  if (!time || typeof time !== 'string') {
    throw new Error('Invalid time: time must be a non-empty string');
  }

  // Parse time string (format: HH:MM:SS)
  const parts = time.split(':');

  if (parts.length !== 3) {
    throw new Error(`Invalid time format: expected HH:MM:SS, got ${time}`);
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);

  // Validate parsed values
  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error(
      `Invalid time values: cannot parse hours, minutes, or seconds from ${time}`,
    );
  }

  if (hours < 0 || hours > 23) {
    throw new Error(`Invalid hours: must be between 0 and 23, got ${hours}`);
  }

  if (minutes < 0 || minutes > 59) {
    throw new Error(
      `Invalid minutes: must be between 0 and 59, got ${minutes}`,
    );
  }

  if (seconds < 0 || seconds > 59) {
    throw new Error(
      `Invalid seconds: must be between 0 and 59, got ${seconds}`,
    );
  }

  // Convert to minutes since midnight
  return hours * 60 + minutes;
}

/**
 * Detects if a work shift spans midnight (overnight shift).
 *
 * @param startTime - Start time in format "HH:MM:SS"
 * @param endTime - End time in format "HH:MM:SS"
 * @returns true if endTime < startTime (overnight shift), false otherwise
 *
 * @example
 * isOvernightShift("22:00:00", "06:00:00") // returns true
 * isOvernightShift("09:00:00", "17:00:00") // returns false
 * isOvernightShift("08:00:00", "08:00:00") // returns false (24-hour shift, treated as same-day)
 */
export function isOvernightShift(startTime: string, endTime: string): boolean {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);

  return endMinutes < startMinutes;
}

/**
 * Calculates the number of hours between start and end times.
 * Handles overnight shifts by adding 24 hours when endTime < startTime.
 *
 * @param startTime - Start time in format "HH:MM:SS"
 * @param endTime - End time in format "HH:MM:SS"
 * @returns Decimal hours with 2 decimal places (e.g., 8.5 for 8 hours 30 minutes)
 * @throws Error if calculated hours exceed 24 hours
 *
 * @example
 * calculateHours("09:00:00", "17:30:00") // returns 8.5 (same-day shift)
 * calculateHours("22:00:00", "06:00:00") // returns 8.0 (overnight shift)
 * calculateHours("23:30:00", "07:15:00") // returns 7.75 (overnight shift)
 */
export function calculateHours(startTime: string, endTime: string): number {
  const startMinutes = convertTimeToMinutes(startTime);
  const endMinutes = convertTimeToMinutes(endTime);

  let totalMinutes: number;

  // Check for overnight shift
  if (endMinutes < startMinutes) {
    // Overnight: add 24 hours (1440 minutes)
    totalMinutes = endMinutes + 1440 - startMinutes;
  } else {
    // Same day
    totalMinutes = endMinutes - startMinutes;
  }

  // Convert to decimal hours
  const hours = totalMinutes / 60;

  // Validate max 24 hours
  if (hours > 24) {
    throw new Error('Work shift cannot exceed 24 hours');
  }

  // Round to 2 decimal places
  return Math.round(hours * 100) / 100;
}
