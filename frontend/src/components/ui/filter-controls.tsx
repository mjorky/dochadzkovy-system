'use client';

import { cn } from "@/lib/utils";
import React from "react";

interface FilterControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FilterControls({ children, className, ...props }: FilterControlsProps) {
  return (
    <div
      className={cn(
        // Responzívny dizajn s flex-wrap pre zalamovanie
        "flex flex-wrap items-end gap-4 p-4 bg-card rounded-lg border border-border mb-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}