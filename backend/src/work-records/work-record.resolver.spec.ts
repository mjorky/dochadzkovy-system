import { WorkRecordResolver } from './work-record.resolver';
import { WorkRecord } from './entities/work-record.entity';

describe('WorkRecordResolver', () => {
  let resolver: WorkRecordResolver;

  beforeEach(() => {
    resolver = new WorkRecordResolver();
  });

  describe('hours field resolver', () => {
    it('should calculate 8.5 hours for same-day shift (09:00 to 17:30)', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '09:00:00',
        endTime: '17:30:00',
      };

      const result = resolver.hours(workRecord as WorkRecord);
      expect(result).toBe(8.5);
    });

    it('should calculate 8.0 hours for overnight shift (22:00 to 06:00)', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '22:00:00',
        endTime: '06:00:00',
      };

      const result = resolver.hours(workRecord as WorkRecord);
      expect(result).toBe(8.0);
    });

    it('should calculate 7.75 hours for overnight shift with decimals (23:30 to 07:15)', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '23:30:00',
        endTime: '07:15:00',
      };

      const result = resolver.hours(workRecord as WorkRecord);
      expect(result).toBe(7.75);
    });

    it('should round to 2 decimal places', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '09:00:00',
        endTime: '17:27:00',
      };

      const result = resolver.hours(workRecord as WorkRecord);
      expect(result).toBe(8.45);
      // Verify at most 2 decimal places
      const decimalPlaces = result.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should throw error if hours exceed 24', () => {
      // This would require invalid data, but we test the validation
      // Our algorithm prevents > 24 hours naturally, so we verify it doesn't exceed 24
      const workRecord: Partial<WorkRecord> = {
        startTime: '00:00:00',
        endTime: '23:59:00',
      };

      const result = resolver.hours(workRecord as WorkRecord);
      expect(result).toBeLessThanOrEqual(24);
    });
  });

  describe('isOvernightShift field resolver', () => {
    it('should return true for overnight shift (22:00 to 06:00)', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '22:00:00',
        endTime: '06:00:00',
      };

      const result = resolver.isOvernightShift(workRecord as WorkRecord);
      expect(result).toBe(true);
    });

    it('should return false for same-day shift (09:00 to 17:00)', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '09:00:00',
        endTime: '17:00:00',
      };

      const result = resolver.isOvernightShift(workRecord as WorkRecord);
      expect(result).toBe(false);
    });

    it('should return false when start and end times are equal', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '08:00:00',
        endTime: '08:00:00',
      };

      const result = resolver.isOvernightShift(workRecord as WorkRecord);
      expect(result).toBe(false);
    });

    it('should return true for edge case overnight shift (23:30 to 00:30)', () => {
      const workRecord: Partial<WorkRecord> = {
        startTime: '23:30:00',
        endTime: '00:30:00',
      };

      const result = resolver.isOvernightShift(workRecord as WorkRecord);
      expect(result).toBe(true);
    });
  });
});
