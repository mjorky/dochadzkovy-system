"use client";

import { useState, useEffect } from "react";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

// CUSTOM COMPONENTS
import {
  ReportGenerateButton,
  ReportSuccessCard,
} from "@/components/report-actions";
import { ReportConfiguration } from "@/components/report-configuration";
import { useAuth } from "@/providers/auth-provider";
import { useTranslations } from "@/contexts/dictionary-context";

// Dynamic import for PDF Viewer
const PdfViewerDialog = dynamic(
  () =>
    import("@/components/pdf-viewer-dialog").then((mod) => ({
      default: mod.PdfViewerDialog,
    })),
  { ssr: false },
);

// --- 1. QUERIES ---
export const GET_EMPLOYEES_CATALOG = gql`
  query GetEmployeesCatalog {
    employees {
      id
      fullName
    }
  }
`;

const GET_WORK_REPORT_DATA = gql`
  query GetWorkReportData($employeeId: Int!, $month: Int!, $year: Int!) {
    getWorkReportData(employeeId: $employeeId, month: $month, year: $year) {
      totalWorkDays
      totalHours
      weekendWorkHours
      holidayWorkHours
    }
  }
`;

const GET_WORK_LIST_REPORT = gql`
  query GetWorkListReport($input: WorkReportInput!) {
    getWorkListReport(input: $input) {
      items {
        projectNumber
        projectName
        productiveHours
        nonProductiveHours
        productiveOutSkCzHours
        nonProductiveZHours
        productive70Hours
        travelKm
        projectManagerName
      }
    }
  }
`;

const GET_WORK_LIST_REPORT_PDF = gql`
  query GetWorkListReportPDF($input: WorkReportInput!) {
    getWorkListReportPDF(input: $input)
  }
`;

// --- TYPES ---
export interface EmployeeCatalogItem {
  id: string;
  fullName: string;
}
export interface EmployeesCatalogData {
  employees: EmployeeCatalogItem[];
}

// --- HELPERS ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

interface WorkListReportItem {
  projectNumber: string;
  projectName: string;
  productiveHours: number;
  nonProductiveHours: number;
  productiveOutSkCzHours: number;
  nonProductiveZHours: number;
  productive70Hours: number;
  travelKm: number;
  projectManagerName: string;
}

interface WorkListReportData {
  getWorkListReport: {
    items: WorkListReportItem[];
  };
}

interface WorkListReportPdfData {
  getWorkListReportPDF: string;
}

interface WorkReportDataResponse {
  getWorkReportData: {
    totalWorkDays: number;
    totalHours: number;
    weekendWorkHours: number;
    holidayWorkHours: number;
  };
}

// --- MAIN COMPONENT ---
export default function WorkReportPage() {
  const t = useTranslations();
  const { user } = useAuth();

  // State: Filters
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  useEffect(() => {
    if (user?.id && !selectedEmployee) {
      setSelectedEmployee(user.id);
    }
  }, [user, selectedEmployee]);

  const [date, setDate] = useState<Date>(new Date());

  // State: Signature
  const [signatureFile, setSignatureFile] = useState<File[] | undefined>();
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // State: PDF
  const [pdfFileBlob, setPdfFileBlob] = useState<Blob | null>(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  // --- API Hooks ---
  const { data: employeesData } = useQuery<EmployeesCatalogData>(
    GET_EMPLOYEES_CATALOG,
  );

  const { data: summaryData, refetch: refetchSummary } =
    useQuery<WorkReportDataResponse>(GET_WORK_REPORT_DATA, {
      variables: {
        employeeId: parseInt(selectedEmployee || "0"),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      },
      skip: !selectedEmployee,
    });

  const [
    getProjectReport,
    { data: projectReportData, loading: projectReportLoading },
  ] = useLazyQuery<WorkListReportData>(GET_WORK_LIST_REPORT);

  const [
    generateWorkListPdf,
    { loading: workListPdfLoading, data: workListPdfData },
  ] = useLazyQuery<WorkListReportPdfData>(GET_WORK_LIST_REPORT_PDF, {
    fetchPolicy: "network-only",
  });

  // --- Effects ---
  useEffect(() => {
    if (selectedEmployee && date) {
      getProjectReport({
        variables: {
          input: {
            employeeId: parseInt(selectedEmployee),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
          },
        },
      });
      refetchSummary();
      setPdfFileBlob(null); // Reset PDF when filters change
    }
  }, [selectedEmployee, date, getProjectReport, refetchSummary]);

  useEffect(() => {
    if (workListPdfData?.getWorkListReportPDF) {
      try {
        const byteCharacters = atob(workListPdfData.getWorkListReportPDF);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        setPdfFileBlob(blob);
        toast.success(t.reports.projectSummaryGenerated);
      } catch (error) {
        console.error("Error processing PDF:", error);
        toast.error(t.reports.failedToProcess);
      }
    }
  }, [workListPdfData]);

  useEffect(() => {
    return () => {
      if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    };
  }, [signaturePreview]);

  // --- Handlers ---

  const handleSignatureDrop = (files: File[]) => {
    setSignatureFile(files);
    if (files && files[0]) {
      const previewUrl = URL.createObjectURL(files[0]);
      setSignaturePreview(previewUrl);
    } else {
      setSignaturePreview(null);
    }
  };

  const clearSignature = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSignatureFile(undefined);
    setSignaturePreview(null);
  };

  const handleGenerateProjectSummaryPdf = async () => {
    if (!selectedEmployee) {
      toast.warning(t.reports.pleaseSelectEmployee);
      return;
    }

    let signatureBase64: string | undefined = undefined;
    if (signatureFile && signatureFile[0]) {
      try {
        signatureBase64 = await fileToBase64(signatureFile[0]);
      } catch (error) {
        toast.error(t.reports.failedToProcessSignature);
        return;
      }
    }

    generateWorkListPdf({
      variables: {
        input: {
          employeeId: parseInt(selectedEmployee),
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          signatureImage: signatureBase64,
        },
      },
    });
  };

  const handleDownloadPdf = () => {
    if (!pdfFileBlob) return;
    const url = URL.createObjectURL(pdfFileBlob);
    const link = document.createElement("a");
    link.href = url;
    const empName =
      employeesData?.employees.find((e) => e.id === selectedEmployee)
        ?.fullName || "report";
    link.download = `WorkReport_${empName.replace(/\s+/g, "_")}_${date.getMonth() + 1}_${date.getFullYear()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t.reports.downloadedSuccessfully);
  };

  const projectItems = projectReportData?.getWorkListReport?.items || [];
  const projectTotals = projectItems.reduce(
    (acc, item: WorkListReportItem) => ({
      prodSK: acc.prodSK + item.productiveHours,
      nonProdSK: acc.nonProdSK + item.nonProductiveHours,
      prodZ: acc.prodZ + item.productiveOutSkCzHours,
      nonProdZ: acc.nonProdZ + item.nonProductiveZHours,
      prod70: acc.prod70 + item.productive70Hours,
      travel: acc.travel + item.travelKm,
    }),
    { prodSK: 0, nonProdSK: 0, prodZ: 0, nonProdZ: 0, prod70: 0, travel: 0 },
  );

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6">
          {/* NOVÝ ZJEDNOTENÝ CONFIGURATION KOMPONENT */}
          <ReportConfiguration
            selectedEmployeeId={selectedEmployee || null}
            onEmployeeChange={(val) => setSelectedEmployee(val || "")}
            selectedMonth={date}
            onMonthChange={setDate}
            isAdmin={!!user?.isAdmin}
            isManager={!!user?.isManager}
          />

          {/* Options Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.reports.reportOptions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Signature */}
              <div className="space-y-2">
                <Label>{t.reports.digitalSignature}</Label>
                <Dropzone
                  accept={{ "image/*": [] }}
                  onDrop={handleSignatureDrop}
                  onError={console.error}
                  src={signatureFile}
                  maxFiles={1}
                  className="w-full"
                >
                  {!signaturePreview && (
                    <>
                      <DropzoneEmptyState />
                      <DropzoneContent />
                    </>
                  )}
                  {signaturePreview && (
                    <div className="relative w-full h-full flex justify-center items-center p-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 z-10"
                        onClick={clearSignature}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <img
                        src={signaturePreview}
                        alt={t.reports.signaturePreview}
                        className="max-h-[100px] object-contain"
                      />
                    </div>
                  )}
                </Dropzone>
              </div>

              <Separator className="my-4" />

              {/* REUSABLE GENERATE BUTTON */}
              <ReportGenerateButton
                onGenerate={handleGenerateProjectSummaryPdf}
                isLoading={workListPdfLoading}
                isDisabled={!selectedEmployee}
                label="Generate PDF Report"
                loadingLabel="Generating Report..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Data Display */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          {/* Summary Stats */}
          {summaryData?.getWorkReportData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold">
                    {summaryData.getWorkReportData.totalWorkDays}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t.reports.days}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {summaryData.getWorkReportData.totalHours.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t.reports.hours}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {summaryData.getWorkReportData.weekendWorkHours.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t.reports.weekendHoursShort}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {summaryData.getWorkReportData.holidayWorkHours.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    {t.reports.holidayHoursShort}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detailed Project Table */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{t.reports.projectBreakdown}</CardTitle>
              <CardDescription>
                {t.reports.projectBreakdownDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border max-h-[500px] overflow-y-auto relative bg-background flex flex-col">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="whitespace-nowrap">
                        {t.reports.projectNo}
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[200px]">
                        {t.reports.projectName}
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        {t.reports.prodSK}
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        {t.reports.nonProdSK}
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        {t.reports.prodZ}
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        {t.reports.nonProdZ}
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        {t.reports.prod70}
                      </TableHead>
                      <TableHead className="text-center whitespace-nowrap">
                        KM
                      </TableHead>
                      <TableHead className="whitespace-nowrap">PM</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectReportLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : projectItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="h-24 text-center text-muted-foreground"
                        >
                          {selectedEmployee
                            ? t.reports.noDataFound
                            : t.reports.selectEmployeeToView}
                        </TableCell>
                      </TableRow>
                    ) : (
                      <>
                        {projectItems.map((item: any, idx: number) => (
                          <TableRow key={idx} className="group">
                            <TableCell className="font-medium whitespace-nowrap">
                              {item.projectNumber}
                            </TableCell>
                            <TableCell
                              className="max-w-[300px] truncate"
                              title={item.projectName}
                            >
                              {item.projectName}
                            </TableCell>
                            <TableCell className="text-center font-medium">
                              {item.productiveHours > 0
                                ? item.productiveHours.toFixed(2)
                                : "0"}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {item.nonProductiveHours > 0
                                ? item.nonProductiveHours.toFixed(2)
                                : "0"}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {item.productiveOutSkCzHours > 0
                                ? item.productiveOutSkCzHours.toFixed(2)
                                : "0"}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {item.nonProductiveZHours > 0
                                ? item.nonProductiveZHours.toFixed(2)
                                : "0"}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {item.productive70Hours > 0
                                ? item.productive70Hours.toFixed(2)
                                : "0"}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.travelKm}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">
                              {item.projectManagerName}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-primary/5 font-bold">
                          <TableCell colSpan={2}>{t.reports.total}</TableCell>
                          <TableCell className="text-center">
                            {projectTotals.prodSK.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {projectTotals.nonProdSK.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {projectTotals.prodZ.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {projectTotals.nonProdZ.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {projectTotals.prod70.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {projectTotals.travel}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
                <div className="p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center shrink-0">
                  {t.workRecords.showing} {projectItems.length} {t.projects.countSuffix}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* REUSABLE SUCCESS CARD */}
          {pdfFileBlob && (
            <ReportSuccessCard
              onView={() => setIsPdfViewerOpen(true)}
              onDownload={handleDownloadPdf}
            />
          )}
        </div>
      </div>

      {/* PDF Dialog (Dynamically Loaded) */}
      {PdfViewerDialog && (
        <PdfViewerDialog
          open={isPdfViewerOpen}
          onOpenChange={setIsPdfViewerOpen}
          pdfFileBlob={pdfFileBlob}
          handleDownloadPdf={handleDownloadPdf}
        />
      )}
    </div>
  );
}
