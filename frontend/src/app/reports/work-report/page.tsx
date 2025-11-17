'use client';

import { useState, useEffect } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { Loader2, FileDown, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MonthPicker } from '@/components/ui/month-picker';
import { EmployeeSelector } from '@/components/employee-selector';
import { GET_EMPLOYEES_CATALOG, EmployeesCatalogData } from '@/graphql/queries/employees';
import { GET_WORK_REPORT_PDF, GET_WORK_REPORT_DATA, WorkReportSummaryData } from '@/graphql/queries/reports';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

// Dynamic import for PdfViewerDialog component to ensure it's rendered only on the client
const PdfViewerDialog = dynamic(() => import('@/components/pdf-viewer-dialog').then(mod => ({ default: mod.PdfViewerDialog })), { ssr: false });

// Mock user context - will be replaced by actual auth context
const mockUser = {
  id: '', // No default selected user
  isAdmin: true,
  isManager: false,
};

export default function WorkReportPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfFileBlob, setPdfFileBlob] = useState<Blob | null>(null); // State for PDF Blob
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false); // State to control PDF dialog

  // Fetch employees for the dropdown
  const { data: employeesData } = useQuery<EmployeesCatalogData>(GET_EMPLOYEES_CATALOG);

  // Fetch summary data for preview
  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery<WorkReportSummaryData>(GET_WORK_REPORT_DATA, {
    variables: {
      employeeId: parseInt(selectedEmployeeId || '0', 10),
      month: selectedMonth.getMonth() + 1,
      year: selectedMonth.getFullYear(),
    },
    skip: !selectedEmployeeId,
    onError: (error) => {
      console.error("Summary Data Query Failed:", error);
    },
  });

  // Lazy query for PDF generation
  const [generatePdf, { loading: pdfLoading, error: pdfError, data: pdfData }] = useLazyQuery(GET_WORK_REPORT_PDF, {
    fetchPolicy: 'network-only', // Ensure fresh data always fetched
    onError: (error) => {
      toast.error(`Failed to generate PDF: ${error.message}`);
    },
  });

  // Process the generated PDF data when it's available
  useEffect(() => {
    if (pdfData?.getWorkReportPDF) {
      try {
        const byteCharacters = atob(pdfData.getWorkReportPDF);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        setPdfFileBlob(blob);
        setPdfBase64(pdfData.getWorkReportPDF);
        toast.success('PDF report generated successfully!');
      } catch (blobError) {
        console.error("Error converting base64 to Blob:", blobError);
        toast.error("Failed to process PDF data for viewing.");
        setPdfFileBlob(null);
      }
    } else if (pdfData) {
      toast.error('Received empty data for PDF report.');
      setPdfFileBlob(null);
    }
  }, [pdfData]);

  const handleMonthSelect = (date: Date) => {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    setSelectedMonth(firstDayOfMonth);
    setMonthPickerOpen(false);
  };

  useEffect(() => {
    if (selectedEmployeeId && selectedMonth) {
      refetchSummary();
      setPdfBase64(null);
      setPdfFileBlob(null);
      setIsPdfViewerOpen(false);
    }
  }, [selectedEmployeeId, selectedMonth, refetchSummary]);

  const handleDownloadPdf = () => {
    if (!pdfFileBlob) {
      toast.error('No PDF to download. Please generate it first.');
      return;
    }

    try {
      const url = URL.createObjectURL(pdfFileBlob);
      
      const link = document.createElement('a');
      link.href = url;
      const employeeName = employeesData?.employees.find(e => e.id === selectedEmployeeId)?.fullName || 'report';
      const month = selectedMonth.toLocaleString('en', { month: 'long' });
      link.download = `work-report-${employeeName.replace(/ /g, '_')}-${month}-${selectedMonth.getFullYear()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error('Failed to download PDF. It might be corrupted.');
    }
  };

  const handleGenerateClick = () => {
    if (!selectedEmployeeId || !selectedMonth) {
      toast.warning('Please select an employee and a month.');
      return;
    }
    generatePdf({
      variables: {
        employeeId: parseInt(selectedEmployeeId, 10),
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Work Reports</h1>
        <p className="text-muted-foreground mt-2">Generate monthly PDF reports for employees.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select an employee and a month to generate their work report.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <EmployeeSelector
              currentEmployeeId={selectedEmployeeId}
              onEmployeeChange={setSelectedEmployeeId}
              isAdmin={mockUser.isAdmin}
              isManager={mockUser.isManager}
              placeholder="Select an employee..."
            />
            <Popover open={monthPickerOpen} onOpenChange={setMonthPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {selectedMonth ? (
                    selectedMonth.toLocaleString('sk-SK', { month: 'long', year: 'numeric' })
                  ) : (
                    <span>Select month</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <MonthPicker
                  selectedMonth={selectedMonth}
                  onMonthSelect={handleMonthSelect}
                  minDate={new Date(2020, 0)}
                  maxDate={new Date(new Date().getFullYear() + 1, 11)}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateClick} 
              disabled={pdfLoading || summaryLoading || !!summaryError || !selectedEmployeeId}
              className="flex-1"
            >
              {pdfLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="mr-2 h-4 w-4" />
              )}
              {pdfLoading ? 'Generating...' : 'Generate PDF'}
            </Button>
            <Button
              onClick={() => setIsPdfViewerOpen(true)}
              disabled={!pdfFileBlob}
              variant="outline"
              className="flex-shrink-0"
            >
              <FileText className="mr-2 h-4 w-4" />
              View PDF
            </Button>
            <Button
              onClick={handleDownloadPdf}
              disabled={!pdfFileBlob}
              variant="outline"
              className="flex-shrink-0"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary Preview */}
      {(selectedEmployeeId && selectedMonth) && ( // Only show if employee and month are selected
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Report Summary Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading && (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading summary...</span>
              </div>
            )}
            {summaryError && (
              <div className="text-red-500 text-sm">Error loading summary: {summaryError.message}</div>
            )}
            {summaryData && summaryData.getWorkReportData ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{summaryData.getWorkReportData.totalWorkDays}</div>
                  <div className="text-sm text-muted-foreground">Total Work Days</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{summaryData.getWorkReportData.totalHours.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{summaryData.getWorkReportData.weekendWorkHours.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Weekend Hours</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{summaryData.getWorkReportData.holidayWorkHours.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Holiday Hours</div>
                </div>
              </div>
            ) : (
              !summaryLoading && !summaryError && ( // Only show message if no data and not loading/error
                 <p className="text-sm text-muted-foreground text-center">No summary data found for the selected criteria.</p>
              )
            )}
          </CardContent>
        </Card>
      )}


      {/* PDF Viewer Dialog */}
      <PdfViewerDialog 
        open={isPdfViewerOpen} 
        onOpenChange={setIsPdfViewerOpen}
        pdfFileBlob={pdfFileBlob} 
        handleDownloadPdf={handleDownloadPdf} 
      />
    </div>
  );
}