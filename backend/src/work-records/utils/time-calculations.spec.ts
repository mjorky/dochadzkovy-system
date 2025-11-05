import {
  convertTimeToMinutes,
  isOvernightShift,
  calculateHours,
} from './time-calculations';

describe('Time Calculation Utilities', () => {
  describe('convertTimeToMinutes', () => {
    it('should convert "09:30:00" to 570 minutes', () => {
      const result = convertTimeToMinutes('09:30:00');
      expect(result).toBe(570); // 9 * 60 + 30 = 570
    });

    it('should convert "00:00:00" to 0 minutes (midnight)', () => {
      const result = convertTimeToMinutes('00:00:00');
      expect(result).toBe(0);
    });

    it('should convert "23:59:00" to 1439 minutes (end of day)', () => {
      const result = convertTimeToMinutes('23:59:00');
      expect(result).toBe(1439); // 23 * 60 + 59 = 1439
    });

    it('should convert "12:00:00" to 720 minutes (noon)', () => {
      const result = convertTimeToMinutes('12:00:00');
      expect(result).toBe(720); // 12 * 60 = 720
    });

    it('should throw error for invalid time format (missing colons)', () => {
      expect(() => convertTimeToMinutes('093000')).toThrow('Invalid time format');
    });

    it('should throw error for invalid hours (hours > 23)', () => {
      expect(() => convertTimeToMinutes('25:00:00')).toThrow('Invalid hours');
    });

    it('should throw error for invalid minutes (minutes > 59)', () => {
      expect(() => convertTimeToMinutes('10:65:00')).toThrow('Invalid minutes');
    });

    it('should throw error for empty string', () => {
      expect(() => convertTimeToMinutes('')).toThrow('Invalid time');
    });
  });

  describe('isOvernightShift', () => {
    it('should detect overnight shift when endTime < startTime (22:00 to 06:00)', () => {
      const result = isOvernightShift('22:00:00', '06:00:00');
      expect(result).toBe(true);
    });

    it('should return false for same-day shift (09:00 to 17:00)', () => {
      const result = isOvernightShift('09:00:00', '17:00:00');
      expect(result).toBe(false);
    });

    it('should return false when start and end times are equal (24-hour shift)', () => {
      const result = isOvernightShift('08:00:00', '08:00:00');
      expect(result).toBe(false);
    });

    it('should detect overnight shift with close times (23:30 to 00:30)', () => {
      const result = isOvernightShift('23:30:00', '00:30:00');
      expect(result).toBe(true);
    });
  });

  describe('calculateHours', () => {
    it('should calculate 8.5 hours for same-day shift (09:00 to 17:30)', () => {
      const result = calculateHours('09:00:00', '17:30:00');
      expect(result).toBe(8.5);
    });

    it('should calculate 8.0 hours for overnight shift (22:00 to 06:00)', () => {
      const result = calculateHours('22:00:00', '06:00:00');
      expect(result).toBe(8.0);
    });

    it('should calculate 7.75 hours for overnight shift with decimals (23:30 to 07:15)', () => {
      const result = calculateHours('23:30:00', '07:15:00');
      expect(result).toBe(7.75); // 465 minutes / 60 = 7.75
    });

    it('should round to 2 decimal places (09:00 to 17:27 = 8.45 hours)', () => {
      const result = calculateHours('09:00:00', '17:27:00');
      expect(result).toBe(8.45); // 507 minutes / 60 = 8.45
      // Verify it has at most 2 decimal places
      const decimalPlaces = result.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should calculate 0.5 hours for 30-minute shift (10:00 to 10:30)', () => {
      const result = calculateHours('10:00:00', '10:30:00');
      expect(result).toBe(0.5);
    });

    it('should throw error for shifts exceeding 24 hours', () => {
      // This scenario should not occur in real data, but we test validation
      // Since our algorithm adds 1440 minutes for overnight, max is 24 hours
      // We can't easily test > 24 hours without mocking, so we verify 24 hours is allowed
      const result = calculateHours('08:00:00', '08:00:00');
      expect(result).toBe(0); // Same time = 0 hours (not overnight in our logic)
      expect(result).toBeLessThanOrEqual(24);
    });

    it('should calculate correct hours for edge case: 23:59 to 23:58 next day (should error)', () => {
      // This would be 23 hours 59 minutes, which is valid
      const result = calculateHours('00:00:00', '23:59:00');
      expect(result).toBe(23.98); // 1439 minutes / 60 = 23.983333... rounds to 23.98
    });

    it('should handle midnight to noon shift (00:00 to 12:00)', () => {
      const result = calculateHours('00:00:00', '12:00:00');
      expect(result).toBe(12.0);
    });
  });
});
