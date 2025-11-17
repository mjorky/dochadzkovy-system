'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { FileDown } from 'lucide-react';
import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('@/components/pdf-viewer'), { ssr: false });

interface PdfViewerDialogProps {
  pdfFileBlob: Blob | null;
  handleDownloadPdf: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PdfViewerDialog({ pdfFileBlob, handleDownloadPdf, open, onOpenChange }: PdfViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] w-full flex flex-col p-0 gap-0 rounded-lg">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle>Work Report PDF</DialogTitle>
          <DialogDescription>
            Preview of the generated PDF report.
          </DialogDescription>
        </DialogHeader>
        <div 
          className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-4"
          style={{ maxHeight: 'calc(90vh - 180px)' }}
        >
          <PdfViewer pdfFileBlob={pdfFileBlob} />
        </div>
        <DialogFooter className="px-6 pb-6 pt-4 shrink-0 border-t">
          <Button onClick={handleDownloadPdf} disabled={!pdfFileBlob}>
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
