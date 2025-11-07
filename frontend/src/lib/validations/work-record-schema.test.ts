import { describe, it, expect } from 'vitest';
import { workRecordSchema } from './work-record-schema';

describe('workRecordSchema', () => {
  const validData = {
    employeeId: 1,
    date: '2025-02-01',
    absenceTypeId: 1,
    projectId: 100,
    productivityTypeId: 1,
    workTypeId: 5,
    startTime: '08:00',
    endTime: '16:30',
    description: 'Development work',
    km: 0,
    isTripFlag: false,
  };

  describe('valid data', () => {
    it('should validate a complete valid work record', () => {
      const result = workRecordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with optional fields omitted', () => {
      const { description, km, isTripFlag, ...required } = validData;
      const result = workRecordSchema.safeParse(required);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.km).toBe(0); // default
        expect(result.data.isTripFlag).toBe(false); // default
      }
    });

    it('should validate with empty description', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        description: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('employeeId validation', () => {
    it('should reject negative employeeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        employeeId: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero employeeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        employeeId: 0,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer employeeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        employeeId: 1.5,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('date validation', () => {
    it('should reject empty date', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        date: '',
      });
      expect(result.success).toBe(false);
    });

    it('should accept any non-empty date string', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        date: '2025-12-31',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('absenceTypeId validation', () => {
    it('should reject negative absenceTypeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        absenceTypeId: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero absenceTypeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        absenceTypeId: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('projectId validation', () => {
    it('should reject negative projectId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        projectId: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero projectId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        projectId: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('productivityTypeId validation', () => {
    it('should reject negative productivityTypeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        productivityTypeId: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero productivityTypeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        productivityTypeId: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('workTypeId validation', () => {
    it('should reject negative workTypeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        workTypeId: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject zero workTypeId', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        workTypeId: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('startTime validation', () => {
    it('should reject empty startTime', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        startTime: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidFormats = ['8:00', '08:0', '800', '08-00', 'invalid'];
      invalidFormats.forEach((format) => {
        const result = workRecordSchema.safeParse({
          ...validData,
          startTime: format,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should reject times not in 30-minute increments', () => {
      const invalidTimes = ['08:15', '08:25', '08:45', '08:05', '08:55'];
      invalidTimes.forEach((time) => {
        const result = workRecordSchema.safeParse({
          ...validData,
          startTime: time,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid 30-minute increment times', () => {
      const validTimes = ['00:00', '08:00', '08:30', '12:00', '23:30'];
      validTimes.forEach((time) => {
        const result = workRecordSchema.safeParse({
          ...validData,
          startTime: time,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('endTime validation', () => {
    it('should reject empty endTime', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        endTime: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid time format', () => {
      const invalidFormats = ['16:0', '1600', '16-00', 'invalid'];
      invalidFormats.forEach((format) => {
        const result = workRecordSchema.safeParse({
          ...validData,
          endTime: format,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should reject times not in 30-minute increments', () => {
      const invalidTimes = ['16:15', '16:25', '16:45', '16:05', '16:55'];
      invalidTimes.forEach((time) => {
        const result = workRecordSchema.safeParse({
          ...validData,
          endTime: time,
        });
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid 30-minute increment times', () => {
      const validTimes = ['00:00', '16:00', '16:30', '23:00', '23:30'];
      validTimes.forEach((time) => {
        const result = workRecordSchema.safeParse({
          ...validData,
          endTime: time,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('description validation', () => {
    it('should accept descriptions up to 500 characters', () => {
      const description = 'a'.repeat(500);
      const result = workRecordSchema.safeParse({
        ...validData,
        description,
      });
      expect(result.success).toBe(true);
    });

    it('should reject descriptions over 500 characters', () => {
      const description = 'a'.repeat(501);
      const result = workRecordSchema.safeParse({
        ...validData,
        description,
      });
      expect(result.success).toBe(false);
    });

    it('should accept undefined description', () => {
      const { description, ...data } = validData;
      const result = workRecordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept empty string description', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        description: '',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('km validation', () => {
    it('should accept zero km', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        km: 0,
      });
      expect(result.success).toBe(true);
    });

    it('should accept positive km values', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        km: 100,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative km', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        km: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer km', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        km: 50.5,
      });
      expect(result.success).toBe(false);
    });

    it('should default to 0 when omitted', () => {
      const { km, ...data } = validData;
      const result = workRecordSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.km).toBe(0);
      }
    });
  });

  describe('isTripFlag validation', () => {
    it('should accept true', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        isTripFlag: true,
      });
      expect(result.success).toBe(true);
    });

    it('should accept false', () => {
      const result = workRecordSchema.safeParse({
        ...validData,
        isTripFlag: false,
      });
      expect(result.success).toBe(true);
    });

    it('should default to false when omitted', () => {
      const { isTripFlag, ...data } = validData;
      const result = workRecordSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isTripFlag).toBe(false);
      }
    });
  });
});
