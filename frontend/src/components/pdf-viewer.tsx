import React, { useState, useRef, useEffect, memo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useInView } from 'react-intersection-observer';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface PdfPageProps {
  pageNumber: number;
  width: number;
}

const PdfPage: React.FC<PdfPageProps> = memo(({ pageNumber, width }) => {
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  return (
    <div ref={ref} className="mb-4 flex justify-center">
      <Card className="overflow-hidden shadow-lg">
        {inView ? (
          <Page
            key={`page_${pageNumber}`}
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            loading={
              <div className="flex h-[842px] w-[595px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
            width={width}
          />
        ) : (
          <div
            className="flex items-center justify-center"
            style={{ height: (width * 297) / 210, width: width }} // A4 aspect ratio
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </Card>
    </div>
  );
});

PdfPage.displayName = 'PdfPage';

interface PdfViewerProps {
  pdfFileBlob: Blob | null;
  className?: string;
}

export default function PdfViewer({ pdfFileBlob, className }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        // Calculate width with padding (2rem = 32px on each side)
        setContainerWidth(containerRef.current.clientWidth - 64);
      }
    };

    // Initial width calculation
    updateWidth();

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  if (!pdfFileBlob) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-muted-foreground">No PDF file to display.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn('w-full', className)}>
      <Document
        file={pdfFileBlob}
        onLoadError={(error) => console.error('Error loading PDF document:', error)}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading document...</p>
            </div>
          </div>
        }
      >
        {numPages &&
          containerWidth > 0 &&
          Array.from(new Array(numPages), (_, index) => (
            <PdfPage key={`page_${index + 1}`} pageNumber={index + 1} width={containerWidth} />
          ))}
      </Document>
    </div>
  );
}




