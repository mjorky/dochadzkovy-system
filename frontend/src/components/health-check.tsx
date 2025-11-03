'use client';

import { useQuery } from '@apollo/client';
import { HEALTH_QUERY, HealthData } from '@/graphql/queries/health';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function HealthCheck() {
  const { loading, error, data } = useQuery<HealthData>(HEALTH_QUERY);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-6 bg-card rounded-lg border border-border shadow-md">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">Checking connection...</p>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-6 bg-card rounded-lg border border-destructive shadow-md">
        <XCircle className="h-6 w-6 text-destructive flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-foreground">Connection Failed</p>
          <p className="text-sm text-muted-foreground">
            Unable to connect to backend: {error.message}
          </p>
        </div>
      </div>
    );
  }

  const isConnected =
    data?.health?.status === 'ok' && data?.health?.database === 'connected';

  if (isConnected) {
    return (
      <div className="flex items-center gap-3 p-6 bg-card rounded-lg border border-primary shadow-md">
        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">System Connected</p>
          <p className="text-sm text-muted-foreground">
            Database: <span className="font-medium text-primary">{data.health.database}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-6 bg-card rounded-lg border border-border shadow-md">
      <XCircle className="h-6 w-6 text-muted-foreground" />
      <div>
        <p className="font-medium text-foreground">Unknown Status</p>
        <p className="text-sm text-muted-foreground">
          Unexpected response from server
        </p>
      </div>
    </div>
  );
}
