/**
 * Round a time string to the nearest 30-minute increment.
 *
 * @param time - Time string in HH:MM format
 * @returns Rounded time string in HH:MM format
 *
 * @example
 * roundToNearest30Minutes('08:15') // '08:00'
 * roundToNearest30Minutes('08:45') // '08:30'
 * roundToNearest30Minutes('08:50') // '09:00'
 */
export function roundToNearest30Minutes(time: string): string {
  if (!time || !time.includes(':')) {
    return time;
  }

  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  let minutes = parseInt(minutesStr, 10);

  // Validate parsed values
  if (isNaN(hours) || isNaN(minutes)) {
    return time;
  }

  // Round minutes to nearest 30
  if (minutes < 15) {
    minutes = 0;
  } else if (minutes < 45) {
    minutes = 30;
  } else {
    minutes = 0;
    hours += 1;
  }

  // Handle hour overflow
  if (hours >= 24) {
    hours = 0;
  }

  // Format with leading zeros
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
}

/**
 * Check if a time range represents an overnight shift.
 *
 * @param startTime - Start time in HH:MM format
 * @param endTime - End time in HH:MM format
 * @returns True if endTime is before startTime (overnight)
 *
 * @example
 * isOvernightShift('22:00', '06:00') // true
 * isOvernightShift('08:00', '16:00') // false
 */
export function isOvernightShift(startTime: string, endTime: string): boolean {
  if (!startTime || !endTime) {
    return false;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes < startTotalMinutes;
}
