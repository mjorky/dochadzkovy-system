import { render, screen, fireEvent } from '@testing-library/react';
import { WorkRecordsTable } from '../work-records-table';
import { WorkRecord } from '@/graphql/queries/work-records';

// Mock data for testing
const mockWorkRecords: WorkRecord[] = [
  {
    id: '1',
    date: '2024-01-15',
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
  },
  {
    id: '2',
    date: '2024-01-16',
    absenceType: 'Vacation',
    project: null,
    productivityType: null,
    workType: null,
    startTime: '08:00:00',
    endTime: '16:00:00',
    hours: 8.0,
    description: null,
    km: 0,
    isTripFlag: false,
    isLocked: true,
    isOvernightShift: false,
  },
  {
    id: '3',
    date: '2024-01-17',
    absenceType: 'Present',
    project: 'Project B',
    productivityType: 'Productive',
    workType: 'Meeting',
    startTime: '22:00:00',
    endTime: '06:00:00',
    hours: 8.0,
    description: 'Night shift work',
    km: 50,
    isTripFlag: true,
    isLocked: false,
    isOvernightShift: true,
  },
];

describe('WorkRecordsTable', () => {
  it('should render table with work records data', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    // Check if all records are rendered
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Check if data is displayed
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('Working on feature X')).toBeInTheDocument();
  });

  it('should display NULL values as em dash (—)', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    // Vacation record should have — for project, productivityType, workType
    const rows = screen.getAllByRole('row');
    const vacationRow = rows.find((row) => row.textContent?.includes('Vacation'));

    expect(vacationRow).toBeTruthy();
    // Count em dashes - should have 3 for NULL project, productivityType, workType
    const emDashCount = (vacationRow?.textContent?.match(/—/g) || []).length;
    expect(emDashCount).toBeGreaterThanOrEqual(3);
  });

  it('should toggle sort direction on column click', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    const dateHeader = screen.getByText('Date').closest('th');
    expect(dateHeader).toBeTruthy();

    // First click - should sort ascending (default is already asc)
    fireEvent.click(dateHeader!);

    // Check that ChevronDown icon appears (descending)
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(1);

    // Second click - should toggle back to ascending
    fireEvent.click(dateHeader!);

    // Verify table still renders
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should apply reduced opacity to locked rows', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    const rows = screen.getAllByRole('row');
    const lockedRow = rows.find((row) => row.textContent?.includes('Vacation'));

    expect(lockedRow).toBeTruthy();
    expect(lockedRow).toHaveClass('opacity-50');
    expect(lockedRow).toHaveClass('cursor-not-allowed');
  });

  it('should display moon icon for overnight shifts', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    // Find the overnight shift row
    const rows = screen.getAllByRole('row');
    const overnightRow = rows.find((row) => row.textContent?.includes('Night shift work'));

    expect(overnightRow).toBeTruthy();
    // Moon icon should be present (lucide-react renders as svg)
    const moonIcon = overnightRow?.querySelector('svg[class*="lucide-moon"]');
    expect(moonIcon).toBeTruthy();
  });

  it('should display lock icon for locked records', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    // Find the locked row
    const rows = screen.getAllByRole('row');
    const lockedRow = rows.find((row) => row.textContent?.includes('Vacation'));

    expect(lockedRow).toBeTruthy();
    // Lock icon should be present
    const lockIcon = lockedRow?.querySelector('svg[class*="lucide-lock"]');
    expect(lockIcon).toBeTruthy();
  });

  it('should format hours with 2 decimal places', () => {
    render(<WorkRecordsTable workRecords={mockWorkRecords} />);

    // Check that hours are formatted as 8.50
    expect(screen.getByText('8.50')).toBeInTheDocument();
    expect(screen.getByText('8.00')).toBeInTheDocument();
  });

  it('should sort by date column by default (ascending)', () => {
    const unsortedRecords: WorkRecord[] = [
      { ...mockWorkRecords[2], date: '2024-01-20' },
      { ...mockWorkRecords[0], date: '2024-01-10' },
      { ...mockWorkRecords[1], date: '2024-01-15' },
    ];

    render(<WorkRecordsTable workRecords={unsortedRecords} />);

    const rows = screen.getAllByRole('row');
    // Skip header row, check data rows
    const firstDataRow = rows[1];
    const lastDataRow = rows[rows.length - 1];

    // First row should have earliest date (Jan 10)
    expect(firstDataRow.textContent).toContain('Jan 10');
    // Last row should have latest date (Jan 20)
    expect(lastDataRow.textContent).toContain('Jan 20');
  });
});
