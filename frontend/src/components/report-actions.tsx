'use client';

import { Loader2, FileText, FileDown, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// --- 1. Generate Button Component ---

interface ReportGenerateButtonProps {
  onGenerate: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  label?: string;
  loadingLabel?: string;
}

export function ReportGenerateButton({
  onGenerate,
  isLoading,
  isDisabled,
  label = "Generate PDF Report",
  loadingLabel = "Generating..."
}: ReportGenerateButtonProps) {
  return (
    <Button
      onClick={onGenerate}
      disabled={isDisabled || isLoading}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <FileText className="mr-2 h-4 w-4" />
      )}
      {isLoading ? loadingLabel : label}
    </Button>
  );
}

// --- 2. Success Card Component ---

interface ReportSuccessCardProps {
  onView: () => void;
  onDownload: () => void;
  className?: string;
}

export function ReportSuccessCard({ onView, onDownload, className }: ReportSuccessCardProps) {
  return (
    <Card className={`bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 animate-in fade-in slide-in-from-bottom-4 ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 mb-2">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
            PDF Report Generated Successfully
          </h3>
          <p className="text-sm text-green-700 dark:text-green-300">
            Your document is ready for viewing or download.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button onClick={onView}>
            <FileText className="mr-2 h-4 w-4" /> Open Viewer
          </Button>
          <Button variant="outline" onClick={onDownload}>
            <FileDown className="mr-2 h-4 w-4" /> Save PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}