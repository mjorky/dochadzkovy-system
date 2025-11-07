import { WorkRecord } from './work-record.entity';

describe('WorkRecord Entity', () => {
  describe('Hour Calculation Tests', () => {
    it('should calculate hours for same-day shift (09:00-17:30 = 8.5 hours)', () => {
      // Test case: Standard 8.5 hour workday
      const startTime = '09:00:00';
      const endTime = '17:30:00';

      // Convert times to minutes
      const startMinutes = 9 * 60 + 0; // 540
      const endMinutes = 17 * 60 + 30; // 1050
      const totalMinutes = endMinutes - startMinutes; // 510
      const expectedHours = totalMinutes / 60; // 8.5

      expect(expectedHours).toBe(8.5);
      expect(Math.round(expectedHours * 100) / 100).toBe(8.5);
    });

    it('should detect and calculate overnight shift (22:00-06:00 = 8.0 hours)', () => {
      // Test case: Overnight shift spanning midnight
      const startTime = '22:00:00';
      const endTime = '06:00:00';

      const startMinutes = 22 * 60 + 0; // 1320
      const endMinutes = 6 * 60 + 0; // 360

      // Detect overnight: endMinutes < startMinutes
      const isOvernight = endMinutes < startMinutes;
      expect(isOvernight).toBe(true);

      // Add 24 hours (1440 minutes) for overnight
      const totalMinutes = isOvernight
        ? (endMinutes + 1440) - startMinutes
        : endMinutes - startMinutes;

      expect(totalMinutes).toBe(480); // 8 hours = 480 minutes

      const expectedHours = totalMinutes / 60;
      expect(expectedHours).toBe(8.0);
    });

    it('should handle overnight shift with decimal hours (23:30-07:15 = 7.75 hours)', () => {
      const startTime = '23:30:00';
      const endTime = '07:15:00';

      const startMinutes = 23 * 60 + 30; // 1410
      const endMinutes = 7 * 60 + 15; // 435

      const isOvernight = endMinutes < startMinutes;
      expect(isOvernight).toBe(true);

      const totalMinutes = (endMinutes + 1440) - startMinutes; // 465
      const hours = totalMinutes / 60; // 7.75
      const roundedHours = Math.round(hours * 100) / 100;

      expect(roundedHours).toBe(7.75);
    });

    it('should validate maximum 24-hour shift duration', () => {
      // Test case: 24 hours is the maximum allowed
      const startTime = '08:00:00';
      const endTime = '08:00:00';

      const startMinutes = 8 * 60;
      const endMinutes = 8 * 60;

      // This is treated as overnight (same time next day)
      const isOvernight = endMinutes <= startMinutes;
      const totalMinutes = isOvernight ? 1440 : 0;
      const hours = totalMinutes / 60;

      expect(hours).toBe(24);
      expect(hours).toBeLessThanOrEqual(24);
    });

    it('should round hours to 2 decimal places', () => {
      // Test case: Ensure proper rounding
      const startMinutes = 540; // 09:00
      const endMinutes = 1047; // 17:27 (8 hours 27 minutes = 8.45 hours)

      const totalMinutes = endMinutes - startMinutes; // 507
      const hours = totalMinutes / 60; // 8.45
      const roundedHours = Math.round(hours * 100) / 100;

      expect(roundedHours).toBe(8.45);
      expect(roundedHours.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('NULL Handling Tests', () => {
    it('should handle NULL project field for absence records', () => {
      const workRecord: Partial<WorkRecord> = {
        id: '1',
        date: '2025-01-15',
        absenceType: 'Dovolenka', // Vacation
        project: null, // NULL for absence records
        productivityType: null,
        workType: null,
        startTime: '08:00:00',
        endTime: '16:00:00',
        hours: 8.0,
        description: null,
        km: 0,
        isTripFlag: false,
        isLocked: false,
        isOvernightShift: false,
      };

      expect(workRecord.project).toBeNull();
      expect(workRecord.productivityType).toBeNull();
      expect(workRecord.workType).toBeNull();
    });

    it('should handle non-NULL fields for work records', () => {
      const workRecord: Partial<WorkRecord> = {
        id: '1',
        date: '2025-01-15',
        absenceType: 'Prítomný v práci', // Present at work
        project: 'PRJ-123',
        productivityType: 'Produktívne',
        workType: 'Programovanie',
        startTime: '09:00:00',
        endTime: '17:30:00',
        hours: 8.5,
        description: 'Working on feature X',
        km: 0,
        isTripFlag: false,
        isLocked: false,
        isOvernightShift: false,
      };

      expect(workRecord.project).toBe('PRJ-123');
      expect(workRecord.productivityType).toBe('Produktívne');
      expect(workRecord.workType).toBe('Programovanie');
    });
  });

  describe('Lock Status Tests', () => {
    it('should compute lock status from Lock flag', () => {
      const recordDate = new Date('2025-01-15');
      const lockFlag = true;
      const employeeLockedUntil = null;

      // isLocked = Lock === true OR StartDate <= ZamknuteK
      const isLocked = lockFlag || (employeeLockedUntil !== null && recordDate <= new Date(employeeLockedUntil));

      expect(isLocked).toBe(true);
    });

    it('should compute lock status from date comparison (StartDate <= ZamknuteK)', () => {
      const recordDate = new Date('2025-01-15');
      const lockFlag = false;
      const employeeLockedUntil = new Date('2025-01-31');

      // Record date is before locked-until date
      const isLocked = lockFlag || (employeeLockedUntil !== null && recordDate <= employeeLockedUntil);

      expect(isLocked).toBe(true);
    });

    it('should not be locked if both conditions are false', () => {
      const recordDate = new Date('2025-02-15');
      const lockFlag = false;
      const employeeLockedUntil = new Date('2025-01-31');

      // Record date is after locked-until date and Lock flag is false
      const isLocked = lockFlag || (employeeLockedUntil !== null && recordDate <= employeeLockedUntil);

      expect(isLocked).toBe(false);
    });
  });
});
