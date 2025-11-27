// frontend/src/app/balances/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/providers/auth-provider';
import { BalancesOverview } from '@/components/balances-overview';
import { Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function BalancesPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="max-w-md border-destructive/50 bg-destructive/5 shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 text-center p-8">
            <XCircle className="h-12 w-12 text-destructive" />
            <CardHeader className="p-0">
              <CardTitle className="text-lg">Authentication Required</CardTitle>
              <CardDescription>Please log in to view your balances.</CardDescription>
            </CardHeader>
            <Button onClick={() => window.location.href = '/login'} variant="outline" className="border-destructive/20 hover:bg-destructive/10">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="/" className="hover:text-foreground transition-colors">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Balances Overview</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-foreground">My Balances</h1>
           <p className="text-muted-foreground mt-1">Overview of your remaining vacation and other leave balances for {currentYear}.</p>
        </div>
      </div>

      <BalancesOverview employeeId={user.id} year={currentYear} />
    </div>
  );
}
