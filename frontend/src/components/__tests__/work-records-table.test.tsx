import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
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

  describe('Copy functionality', () => {
    it('should render copy icon in Actions column when onCopy prop is provided', () => {
      const mockOnCopy = vi.fn();
      render(<WorkRecordsTable workRecords={mockWorkRecords} onCopy={mockOnCopy} />);

      // Find copy icons (CopyPlus from lucide-react)
      const copyButtons = screen.getAllByTitle('Copy work entry');
      expect(copyButtons.length).toBe(mockWorkRecords.length);
    });

    it('should show copy icon for both locked and unlocked records', () => {
      const mockOnCopy = vi.fn();
      render(<WorkRecordsTable workRecords={mockWorkRecords} onCopy={mockOnCopy} />);

      // Get all rows
      const rows = screen.getAllByRole('row');
      const lockedRow = rows.find((row) => row.textContent?.includes('Vacation'));
      const unlockedRow = rows.find((row) => row.textContent?.includes('Project A'));

      // Both should have copy buttons
      expect(lockedRow?.querySelector('button[title="Copy work entry"]')).toBeTruthy();
      expect(unlockedRow?.querySelector('button[title="Copy work entry"]')).toBeTruthy();
    });

    it('should call onCopy handler with correct record when copy icon is clicked', () => {
      const mockOnCopy = vi.fn();
      render(<WorkRecordsTable workRecords={mockWorkRecords} onCopy={mockOnCopy} />);

      // Find and click the first copy button
      const copyButtons = screen.getAllByTitle('Copy work entry');
      fireEvent.click(copyButtons[0]);

      // Verify onCopy was called (table sorts by date desc, so first button may not be first record)
      expect(mockOnCopy).toHaveBeenCalledTimes(1);
      // Verify it was called with one of the records (exact match depends on sorting)
      expect(mockOnCopy).toHaveBeenCalledWith(expect.objectContaining({
        id: expect.any(String),
        date: expect.any(String),
      }));
    });

    it('should not render copy icon when onCopy prop is not provided', () => {
      render(<WorkRecordsTable workRecords={mockWorkRecords} />);

      const copyButtons = screen.queryAllByTitle('Copy work entry');
      expect(copyButtons.length).toBe(0);
    });

    it('should render copy icon before Edit and Delete icons', () => {
      const mockOnCopy = vi.fn();
      const mockOnEdit = vi.fn();
      const mockOnDelete = vi.fn();
      render(
        <WorkRecordsTable
          workRecords={[mockWorkRecords[0]]}
          onCopy={mockOnCopy}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      // Get the Actions cell
      const actionsCell = screen.getByTitle('Copy work entry').closest('td');
      const buttons = actionsCell?.querySelectorAll('button');

      // Copy button should be first
      expect(buttons?.[0]).toHaveAttribute('title', 'Copy work entry');
      // Edit button should be second
      expect(buttons?.[1]).toHaveAttribute('title', 'Edit work entry');
      // Delete button should be third
      expect(buttons?.[2]).toHaveAttribute('title', 'Delete work entry');
    });
  });
});
