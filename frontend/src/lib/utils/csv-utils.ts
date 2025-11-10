import { WorkRecord } from '@/graphql/queries/work-records';

/**
 * Escapes a CSV field value, handling commas, quotes, and newlines
 */
function escapeCSVField(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Formats a date string to YYYY-MM-DD format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

/**
 * Formats a time string to HH:MM format (truncates seconds)
 */
function formatTime(timeString: string): string {
  return timeString.substring(0, 5);
}

/**
 * Formats a boolean value to TRUE/FALSE
 */
function formatBoolean(value: boolean): string {
  return value ? 'TRUE' : 'FALSE';
}

/**
 * Generates CSV content from work records
 * Columns: Date, Absence, Project, Productivity, Work Type, Start, End, Hours, Description, KM, Trip, Lock
 */
export function generateCSV(records: WorkRecord[]): string {
  // CSV header row
  const headers = [
    'Date',
    'Absence',
    'Project',
    'Productivity',
    'Work Type',
    'Start',
    'End',
    'Hours',
    'Description',
    'KM',
    'Trip',
    'Lock',
  ];

  // Build CSV rows
  const rows = records.map((record) => {
    return [
      formatDate(record.date),
      escapeCSVField(record.absenceType),
      escapeCSVField(record.project),
      escapeCSVField(record.productivityType),
      escapeCSVField(record.workType),
      formatTime(record.startTime),
      formatTime(record.endTime),
      record.hours.toFixed(2),
      escapeCSVField(record.description),
      record.km.toString(),
      formatBoolean(record.isTripFlag),
      formatBoolean(record.isLocked),
    ].join(',');
  });

  // Combine header and rows
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Generates a filename for CSV export
 * Pattern: work-records-{employee-name}-{start-date}-to-{end-date}.csv
 */
export function generateFilename(
  employeeName: string,
  startDate: Date | null,
  endDate: Date | null
): string {
  // Convert employee name to lowercase and replace spaces with hyphens
  const normalizedName = employeeName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, ''); // Remove special characters

  // Format dates
  const formatDateForFilename = (date: Date | null): string => {
    if (!date) return new Date().toISOString().split('T')[0];
    return date.toISOString().split('T')[0];
  };

  const startDateStr = formatDateForFilename(startDate);
  const endDateStr = formatDateForFilename(endDate);

  return `work-records-${normalizedName}-${startDateStr}-to-${endDateStr}.csv`;
}

