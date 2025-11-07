import { describe, it, expect } from 'vitest';
import { roundToNearest30Minutes, isOvernightShift } from './time-utils';

describe('time-utils', () => {
  describe('roundToNearest30Minutes', () => {
    it('should round down to 00 when minutes < 15', () => {
      expect(roundToNearest30Minutes('08:00')).toBe('08:00');
      expect(roundToNearest30Minutes('08:05')).toBe('08:00');
      expect(roundToNearest30Minutes('08:14')).toBe('08:00');
    });

    it('should round to 30 when 15 <= minutes < 45', () => {
      expect(roundToNearest30Minutes('08:15')).toBe('08:30');
      expect(roundToNearest30Minutes('08:30')).toBe('08:30');
      expect(roundToNearest30Minutes('08:44')).toBe('08:30');
    });

    it('should round up to next hour when minutes >= 45', () => {
      expect(roundToNearest30Minutes('08:45')).toBe('09:00');
      expect(roundToNearest30Minutes('08:50')).toBe('09:00');
      expect(roundToNearest30Minutes('08:59')).toBe('09:00');
    });

    it('should handle hour overflow at midnight', () => {
      expect(roundToNearest30Minutes('23:45')).toBe('00:00');
      expect(roundToNearest30Minutes('23:50')).toBe('00:00');
      expect(roundToNearest30Minutes('23:59')).toBe('00:00');
    });

    it('should preserve already rounded times', () => {
      expect(roundToNearest30Minutes('00:00')).toBe('00:00');
      expect(roundToNearest30Minutes('12:30')).toBe('12:30');
      expect(roundToNearest30Minutes('23:00')).toBe('23:00');
    });

    it('should handle edge cases', () => {
      // Empty string
      expect(roundToNearest30Minutes('')).toBe('');

      // Missing colon
      expect(roundToNearest30Minutes('0800')).toBe('0800');

      // Invalid format
      expect(roundToNearest30Minutes('invalid')).toBe('invalid');

      // NaN values
      expect(roundToNearest30Minutes('aa:bb')).toBe('aa:bb');
    });

    it('should format hours and minutes with leading zeros', () => {
      expect(roundToNearest30Minutes('9:05')).toBe('09:00');
      expect(roundToNearest30Minutes('09:5')).toBe('09:00');
      expect(roundToNearest30Minutes('9:5')).toBe('09:00');
    });
  });

  describe('isOvernightShift', () => {
    it('should return true for overnight shifts', () => {
      expect(isOvernightShift('22:00', '06:00')).toBe(true);
      expect(isOvernightShift('23:30', '01:00')).toBe(true);
      expect(isOvernightShift('20:00', '04:30')).toBe(true);
    });

    it('should return false for same-day shifts', () => {
      expect(isOvernightShift('08:00', '16:00')).toBe(false);
      expect(isOvernightShift('09:30', '17:30')).toBe(false);
      expect(isOvernightShift('00:00', '08:00')).toBe(false);
    });

    it('should return false when start and end times are equal', () => {
      expect(isOvernightShift('08:00', '08:00')).toBe(false);
      expect(isOvernightShift('12:30', '12:30')).toBe(false);
    });

    it('should handle edge cases at midnight', () => {
      expect(isOvernightShift('23:59', '00:00')).toBe(true);
      expect(isOvernightShift('00:00', '00:01')).toBe(false);
      expect(isOvernightShift('23:00', '23:59')).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isOvernightShift('', '')).toBe(false);
      expect(isOvernightShift('08:00', '')).toBe(false);
      expect(isOvernightShift('', '16:00')).toBe(false);
    });

    it('should handle times with and without leading zeros', () => {
      expect(isOvernightShift('22:00', '6:00')).toBe(true);
      expect(isOvernightShift('8:00', '16:00')).toBe(false);
      expect(isOvernightShift('9:30', '5:30')).toBe(true);
    });
  });
});
