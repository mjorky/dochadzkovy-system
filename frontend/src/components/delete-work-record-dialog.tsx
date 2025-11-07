'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteWorkRecord } from '@/hooks/use-delete-work-record';
import { WorkRecord } from '@/graphql/queries/work-records';
import { AlertTriangle } from 'lucide-react';

export interface DeleteWorkRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: WorkRecord | null;
  employeeId: number;
}

export function DeleteWorkRecordDialog({
  open,
  onOpenChange,
  record,
  employeeId,
}: DeleteWorkRecordDialogProps) {
  const { deleteWorkRecord, loading } = useDeleteWorkRecord();

  const handleDelete = async () => {
    if (!record) return;

    try {
      await deleteWorkRecord({
        variables: {
          input: {
            recordId: parseInt(record.id, 10),
            employeeId,
          },
        },
      });
      // Success - close dialog
      onOpenChange(false);
      // TODO: Replace with toast notification
      console.log('Work record deleted successfully');
    } catch (error) {
      // Error handling - keep dialog open
      console.error('Failed to delete work record:', error);
      // TODO: Replace with toast notification
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!record) return null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Work Entry</DialogTitle>
          </div>
          <DialogDescription className="pt-4">
            Are you sure you want to delete this work entry? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{formatDate(record.date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Project:</span>
            <span className="font-medium">{record.project || 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hours:</span>
            <span className="font-medium">{record.hours.toFixed(2)}</span>
          </div>
          {record.description && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Description:</span>
              <span className="font-medium max-w-[200px] truncate" title={record.description}>
                {record.description}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
