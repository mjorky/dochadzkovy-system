import { describe, it, expect } from 'vitest';
import { generateCSV, generateFilename } from './csv-utils';
import { WorkRecord } from '@/graphql/queries/work-records';

const mockWorkRecord: WorkRecord = {
  id: '1',
  date: '2024-01-15T00:00:00.000Z',
  absenceType: 'Present',
  project: 'Project A',
  productivityType: 'Productive',
  workType: 'Development',
  startTime: '09:00:00',
  endTime: '17:30:00',
  hours: 8.5,
  description: 'Working on feature X',
  km: 0,
  isTripFlag: false,
  isLocked: false,
  isOvernightShift: false,
};

describe('csv-utils', () => {
  describe('generateCSV', () => {
    it('should create CSV with correct header row', () => {
      const csv = generateCSV([mockWorkRecord]);
      const lines = csv.split('\n');
      
      expect(lines[0]).toBe('Date,Absence,Project,Productivity,Work Type,Start,End,Hours,Description,KM,Trip,Lock');
    });

    it('should format dates as YYYY-MM-DD', () => {
      const csv = generateCSV([mockWorkRecord]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      
      expect(dataLine).toContain('2024-01-15');
    });

    it('should format times as HH:MM (truncates seconds)', () => {
      const csv = generateCSV([mockWorkRecord]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      const fields = dataLine.split(',');
      
      // Start time should be at index 5, End time at index 6
      expect(fields[5]).toBe('09:00');
      expect(fields[6]).toBe('17:30');
    });

    it('should format booleans as TRUE/FALSE', () => {
      const csv = generateCSV([mockWorkRecord]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      const fields = dataLine.split(',');
      
      // Trip should be FALSE (index 10), Lock should be FALSE (index 11)
      expect(fields[10]).toBe('FALSE');
      expect(fields[11]).toBe('FALSE');
    });

    it('should format TRUE booleans correctly', () => {
      const recordWithTrueFlags: WorkRecord = {
        ...mockWorkRecord,
        isTripFlag: true,
        isLocked: true,
      };
      
      const csv = generateCSV([recordWithTrueFlags]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      const fields = dataLine.split(',');
      
      expect(fields[10]).toBe('TRUE');
      expect(fields[11]).toBe('TRUE');
    });

    it('should handle null values as empty strings', () => {
      const recordWithNulls: WorkRecord = {
        ...mockWorkRecord,
        project: null,
        productivityType: null,
        workType: null,
        description: null,
      };
      
      const csv = generateCSV([recordWithNulls]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      const fields = dataLine.split(',');
      
      // Project (index 2), Productivity (index 3), Work Type (index 4), Description (index 8) should be empty
      expect(fields[2]).toBe('');
      expect(fields[3]).toBe('');
      expect(fields[4]).toBe('');
      expect(fields[8]).toBe('');
    });

    it('should escape commas in description field', () => {
      const recordWithComma: WorkRecord = {
        ...mockWorkRecord,
        description: 'Meeting, discussion, and planning',
      };
      
      const csv = generateCSV([recordWithComma]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      
      // Description should be wrapped in quotes
      expect(dataLine).toContain('"Meeting, discussion, and planning"');
    });

    it('should escape quotes in description field', () => {
      const recordWithQuote: WorkRecord = {
        ...mockWorkRecord,
        description: 'Working on "feature X"',
      };
      
      const csv = generateCSV([recordWithQuote]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      
      // Quotes should be escaped as ""
      expect(dataLine).toContain('"Working on ""feature X"""');
    });

    it('should escape newlines in description field', () => {
      const recordWithNewline: WorkRecord = {
        ...mockWorkRecord,
        description: 'Line 1\nLine 2',
      };
      
      const csv = generateCSV([recordWithNewline]);
      
      // CSV with newline in field will span multiple lines when split
      // The description field should be quoted and contain the newline
      expect(csv).toContain('"Line 1');
      expect(csv).toContain('Line 2"');
      // Verify the CSV contains the quoted description with newline
      expect(csv).toMatch(/,"Line 1[\s\S]*Line 2",/);
    });

    it('should handle multiple records', () => {
      const records: WorkRecord[] = [
        mockWorkRecord,
        { ...mockWorkRecord, id: '2', date: '2024-01-16T00:00:00.000Z' },
        { ...mockWorkRecord, id: '3', date: '2024-01-17T00:00:00.000Z' },
      ];
      
      const csv = generateCSV(records);
      const lines = csv.split('\n');
      
      // Should have header + 3 data rows
      expect(lines.length).toBe(4);
      expect(lines[0]).toContain('Date');
      expect(lines[1]).toContain('2024-01-15');
      expect(lines[2]).toContain('2024-01-16');
      expect(lines[3]).toContain('2024-01-17');
    });

    it('should format hours with 2 decimal places', () => {
      const recordWithDecimalHours: WorkRecord = {
        ...mockWorkRecord,
        hours: 7.75,
      };
      
      const csv = generateCSV([recordWithDecimalHours]);
      const lines = csv.split('\n');
      const dataLine = lines[1];
      const fields = dataLine.split(',');
      
      // Hours should be at index 7
      expect(fields[7]).toBe('7.75');
    });
  });

  describe('generateFilename', () => {
    it('should create filename with employee name in lowercase and hyphenated', () => {
      const filename = generateFilename('Milan Šmotlák', new Date('2024-01-01'), new Date('2024-01-31'));
      
      // Special characters are removed, so 'š' becomes empty, resulting in 'milan-motlk'
      expect(filename).toContain('milan-motlk');
      expect(filename).toMatch(/^work-records-milan-.*-2024-01-01-to-2024-01-31\.csv$/);
    });

    it('should include date range in YYYY-MM-DD format', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const filename = generateFilename('John Doe', startDate, endDate);
      
      expect(filename).toBe('work-records-john-doe-2024-01-01-to-2024-01-31.csv');
    });

    it('should remove special characters from employee name', () => {
      const filename = generateFilename('José María O\'Connor', new Date('2024-01-01'), new Date('2024-01-31'));
      
      // Special characters (accents, apostrophes) are removed by regex [^a-z0-9-]
      // So 'é' and 'í' become empty, apostrophe is removed
      expect(filename).toMatch(/^work-records-jos-mara-oconnor-2024-01-01-to-2024-01-31\.csv$/);
    });

    it('should handle spaces in employee name', () => {
      const filename = generateFilename('Milan Smotlak', new Date('2024-01-01'), new Date('2024-01-31'));
      
      expect(filename).toContain('milan-smotlak');
    });

    it('should handle null dates by using current date', () => {
      const filename = generateFilename('Test User', null, null);
      const today = new Date().toISOString().split('T')[0];
      
      expect(filename).toContain(today);
      expect(filename).toContain('test-user');
    });

    it('should follow the correct filename pattern', () => {
      const filename = generateFilename('Milan Smotlak', new Date('2024-11-01'), new Date('2024-11-30'));
      
      expect(filename).toBe('work-records-milan-smotlak-2024-11-01-to-2024-11-30.csv');
    });
  });
});

