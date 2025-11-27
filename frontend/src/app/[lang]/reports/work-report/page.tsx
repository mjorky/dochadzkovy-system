"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useLazyQuery } from "@apollo/client/react";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import {
  GET_EMPLOYEES_CATALOG,
  EmployeesCatalogData,
} from "@/graphql/queries/employees";
import {
  GET_WORK_REPORT_PDF,
  GET_WORK_REPORT_DATA,
  WorkReportSummaryData,
} from "@/graphql/queries/reports";

interface WorkReportDataResponse {
  getWorkReportData: WorkReportSummaryData;
}

interface WorkReportPdfResponse {
  getWorkReportPDF: string;
}
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/contexts/dictionary-context";

// CUSTOM COMPONENTS
import {
  ReportGenerateButton,
  ReportSuccessCard,
} from "@/components/report-actions";
import { ReportConfiguration } from "@/components/report-configuration";
import { useAuth } from "@/providers/auth-provider";

// Dynamic import for PdfViewerDialog component
const PdfViewerDialog = dynamic(
  () =>
    import("@/components/pdf-viewer-dialog").then((mod) => ({
      default: mod.PdfViewerDialog,
    })),
  { ssr: false },
);

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

// --- Time Picker Component ---
interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
}

function TimePickerPopover({ value, onChange }: TimePickerProps) {
  const t = useTranslations();
  const [hours, minutes] = value.split(":").map(Number);
  const [isOpen, setIsOpen] = useState(false);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);
  const hoursList = Array.from({ length: 24 }, (_, i) => i);
  const minutesList = Array.from({ length: 60 }, (_, i) => i);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (hourScrollRef.current) {
          const selectedHourBtn = hourScrollRef.current.querySelector(
            `[data-value="${hours}"]`,
          );
          selectedHourBtn?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
        if (minuteScrollRef.current) {
          const selectedMinBtn = minuteScrollRef.current.querySelector(
            `[data-value="${minutes}"]`,
          );
          selectedMinBtn?.scrollIntoView({
            block: "center",
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [isOpen, hours, minutes]);

  const handleTimeChange = (type: "hour" | "minute", val: number) => {
    let newH = hours;
    let newM = minutes;
    if (type === "hour") newH = val;
    if (type === "minute") {
      newM = val;
      setIsOpen(false);
    }
    const formatted = `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`;
    onChange(formatted);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || t.reports.selectTime}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover" align="start">
        <div className="flex h-[300px] divide-x">
          <div className="flex flex-col w-20">
            <div className="flex-none py-2 text-center border-b bg-muted/30 z-10">
              <span className="text-xs font-medium text-muted-foreground">
                Hr
              </span>
            </div>
            <div
              ref={hourScrollRef}
              className="flex-1 overflow-y-auto p-2 no-scrollbar space-y-1"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
              }}
            >
              <div className="h-[100px] w-full"></div>
              {hoursList.map((h) => (
                <Button
                  key={h}
                  data-value={h}
                  size="sm"
                  variant={hours === h ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-center rounded-full font-normal",
                    hours !== h &&
                    "text-muted-foreground opacity-50 hover:opacity-100",
                  )}
                  onClick={() => handleTimeChange("hour", h)}
                >
                  {h.toString().padStart(2, "0")}
                </Button>
              ))}
              <div className="h-[100px] w-full"></div>
            </div>
          </div>
          <div className="flex flex-col w-20">
            <div className="flex-none py-2 text-center border-b bg-muted/30 z-10">
              <span className="text-xs font-medium text-muted-foreground">
                Min
              </span>
            </div>
            <div
              ref={minuteScrollRef}
              className="flex-1 overflow-y-auto p-2 no-scrollbar space-y-1"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
              }}
            >
              <div className="h-[100px] w-full"></div>
              {minutesList.map((m) => (
                <Button
                  key={m}
                  data-value={m}
                  size="sm"
                  variant={minutes === m ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-center rounded-full font-normal",
                    minutes !== m &&
                    "text-muted-foreground opacity-50 hover:opacity-100",
                  )}
                  onClick={() => handleTimeChange("minute", m)}
                >
                  {m.toString().padStart(2, "0")}
                </Button>
              ))}
              <div className="h-[100px] w-full"></div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Main Page Component ---

export default function WorkReportPage() {
  const t = useTranslations();
  const { user } = useAuth();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (user?.id && !selectedEmployeeId) {
      setSelectedEmployeeId(user.id);
    }
  }, [user, selectedEmployeeId]);

  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [pdfFileBlob, setPdfFileBlob] = useState<Blob | null>(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  const [signatureFile, setSignatureFile] = useState<File[] | undefined>();
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  const [isLegalReport, setIsLegalReport] = useState(false);
  const [legalReportTime, setLegalReportTime] = useState("08:00");

  const { data: employeesData } = useQuery<EmployeesCatalogData>(
    GET_EMPLOYEES_CATALOG,
  );

  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useQuery<WorkReportDataResponse>(GET_WORK_REPORT_DATA, {
    variables: {
      employeeId: parseInt(selectedEmployeeId || "0", 10),
      month: selectedMonth.getMonth() + 1,
      year: selectedMonth.getFullYear(),
    },
    skip: !selectedEmployeeId,
  });

  useEffect(() => {
    if (summaryError) {
      toast.error(`${t.reports.failedToLoadSummary}: ${summaryError.message}`);
    }
  }, [summaryError]);

  const [
    generateDetailedWorkReportPdf,
    {
      loading: detailedPdfLoading,
      data: detailedPdfData,
      error: detailedPdfError,
    },
  ] = useLazyQuery<WorkReportPdfResponse>(GET_WORK_REPORT_PDF, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (detailedPdfError) {
      toast.error(`${t.reports.failedToGeneratePdf}: ${detailedPdfError.message}`);
    }
  }, [detailedPdfError]);

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

  useEffect(() => {
    return () => {
      if (signaturePreview) URL.revokeObjectURL(signaturePreview);
    };
  }, [signaturePreview]);

  useEffect(() => {
    if (detailedPdfData?.getWorkReportPDF) {
      try {
        const byteCharacters = atob(detailedPdfData.getWorkReportPDF);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        setPdfFileBlob(blob);
        toast.success(t.reports.pdfGenerated);
      } catch (blobError) {
        console.error("Error converting base64 to Blob:", blobError);
        toast.error(t.reports.failedToProcess);
        setPdfFileBlob(null);
      }
    } else if (detailedPdfData) {
      toast.error(t.reports.receivedEmptyData);
      setPdfFileBlob(null);
    }
  }, [detailedPdfData]);

  useEffect(() => {
    if (selectedEmployeeId && selectedMonth) {
      refetchSummary();
      setPdfFileBlob(null);
      setIsPdfViewerOpen(false);
    }
  }, [selectedEmployeeId, selectedMonth, refetchSummary]);

  const handleDownloadPdf = () => {
    if (!pdfFileBlob) {
      toast.error(t.reports.noPdfToDownload);
      return;
    }
    try {
      const url = URL.createObjectURL(pdfFileBlob);
      const link = document.createElement("a");
      link.href = url;
      const employeeName =
        employeesData?.employees.find((e) => e.id === selectedEmployeeId)
          ?.fullName || "report";
      const month = selectedMonth.toLocaleString("en", { month: "long" });
      link.download = `work-report-${employeeName.replace(/ /g, "_")}-${month}-${selectedMonth.getFullYear()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t.reports.pdfDownloaded);
    } catch (error) {
      console.error("Failed to download PDF:", error);
      toast.error(t.reports.failedToDownload);
    }
  };

  const handleGenerateClick = async () => {
    if (!selectedEmployeeId || !selectedMonth) {
      toast.warning(t.reports.pleaseSelectEmployeeAndMonth);
      return;
    }

    let signatureImageBase64: string | undefined = undefined;
    if (signatureFile && signatureFile[0]) {
      try {
        signatureImageBase64 = await fileToBase64(signatureFile[0]);
      } catch (error) {
        toast.error(t.reports.failedToReadSignature);
        return;
      }
    }

    generateDetailedWorkReportPdf({
      variables: {
        employeeId: parseInt(selectedEmployeeId, 10),
        month: selectedMonth.getMonth() + 1,
        year: selectedMonth.getFullYear(),
        signatureImage: signatureImageBase64,
        isLegalReport: isLegalReport,
        legalReportTime: legalReportTime,
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* NOVÝ ZJEDNOTENÝ CONFIGURATION KOMPONENT */}
          <ReportConfiguration
            selectedEmployeeId={selectedEmployeeId}
            onEmployeeChange={setSelectedEmployeeId}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            isAdmin={!!user?.isAdmin}
            isManager={!!user?.isManager}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t.reports.reportOptions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="legal-report-checkbox"
                    checked={isLegalReport}
                    onCheckedChange={(checked) =>
                      setIsLegalReport(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="legal-report-checkbox"
                    className="font-medium cursor-pointer"
                  >
                    {t.reports.legalReport}
                  </Label>
                </div>

                {isLegalReport && (
                  <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      {t.reports.workStartTime}
                    </Label>

                    <TimePickerPopover
                      value={legalReportTime}
                      onChange={setLegalReportTime}
                    />
                  </div>
                )}
              </div>

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
                onGenerate={handleGenerateClick}
                isLoading={detailedPdfLoading}
                isDisabled={
                  detailedPdfLoading ||
                  summaryLoading ||
                  !!summaryError ||
                  !selectedEmployeeId
                }
                label="Generate PDF Report"
                loadingLabel="Generating Report..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {selectedEmployeeId && selectedMonth ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryLoading ? (
                Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="h-24" />
                    </Card>
                  ))
              ) : summaryData?.getWorkReportData ? (
                <>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">
                        {summaryData.getWorkReportData?.totalWorkDays}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t.reports.workDays}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">
                        {summaryData.getWorkReportData?.totalHours?.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t.reports.totalHours}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">
                        {summaryData.getWorkReportData?.weekendWorkHours?.toFixed(
                          2,
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t.reports.weekendHours}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold">
                        {summaryData.getWorkReportData?.holidayWorkHours?.toFixed(
                          2,
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                        {t.reports.holidayHours}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="col-span-4 text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  {t.reports.noDataFound}
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-muted/5 border-dashed">
              <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-muted-foreground">
                  {t.reports.selectEmployeeToView}
                </p>
              </CardContent>
            </Card>
          )}

          {/* REUSABLE SUCCESS CARD */}
          {pdfFileBlob && (
            <ReportSuccessCard
              onView={() => setIsPdfViewerOpen(true)}
              onDownload={handleDownloadPdf}
            />
          )}
        </div>
      </div>

      <PdfViewerDialog
        open={isPdfViewerOpen}
        onOpenChange={setIsPdfViewerOpen}
        pdfFileBlob={pdfFileBlob}
        handleDownloadPdf={handleDownloadPdf}
      />
    </div>
  );
}
