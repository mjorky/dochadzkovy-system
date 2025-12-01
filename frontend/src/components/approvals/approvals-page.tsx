"use client";

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/providers/auth-provider';
import { GET_APPROVAL_REQUESTS_BY_MANAGER } from '@/graphql/queries/approval-requests';
import { APPROVE_REQUEST, REJECT_REQUEST } from '@/graphql/mutations/approval-requests';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCardSkeleton } from "@/components/skeletons/dashboard-card-skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FileText, CheckCircle, XCircle, Clock, History } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Dictionary {
    approvalRequests: {
        approvalsTitle: string;
        employee: string;
        type: string;
        dateFrom: string;
        dateTo: string;
        note: string;
        approve: string;
        reject: string;
        approveConfirm: string;
        rejectConfirm: string;
        successApprove: string;
        successReject: string;
        errorApprove: string;
        errorReject: string;
        noPendingRequests: string;
        noPendingRequestsDescription: string;
        noHistoryRequests: string;
        noHistoryRequestsDescription: string;
        hours: string;
        status: string;
        pending: string;
        approved: string;
        rejected: string;
        history: string;
    };
    common: {
        loading: string;
        cancel: string;
    };
}

export default function ApprovalsPage({ dict }: { dict: Dictionary }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("pending");

    const { data: pendingData, loading: pendingLoading, refetch: refetchPending } = useQuery(GET_APPROVAL_REQUESTS_BY_MANAGER, {
        variables: { managerId: user?.id, status: ['PENDING'] },
        skip: !user?.id,
        fetchPolicy: 'network-only',
    });

    const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useQuery(GET_APPROVAL_REQUESTS_BY_MANAGER, {
        variables: { managerId: user?.id, status: ['APPROVED', 'REJECTED'] },
        skip: !user?.id,
        fetchPolicy: 'network-only',
    });

    const [approveRequest, { loading: approving }] = useMutation(APPROVE_REQUEST, {
        onCompleted: () => {
            toast.success(dict.approvalRequests.successApprove);
            refetchPending();
            refetchHistory();
        },
        onError: (error: Error) => {
            toast.error(dict.approvalRequests.errorApprove, {
                description: error.message,
            });
        },
    });

    const [rejectRequest, { loading: rejecting }] = useMutation(REJECT_REQUEST, {
        onCompleted: () => {
            toast.success(dict.approvalRequests.successReject);
            refetchPending();
            refetchHistory();
        },
        onError: (error: Error) => {
            toast.error(dict.approvalRequests.errorReject, {
                description: error.message,
            });
        },
    });

    const handleApprove = async (id: string) => {
        await approveRequest({
            variables: {
                id: parseInt(id),
                approverId: user?.id,
            },
        });
    };

    const handleReject = async (id: string) => {
        await rejectRequest({
            variables: {
                id: parseInt(id),
                approverId: user?.id,
            },
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-green-500 hover:bg-green-600">{dict.approvalRequests.approved}</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive">{dict.approvalRequests.rejected}</Badge>;
            default:
                return <Badge variant="secondary">{dict.approvalRequests.pending}</Badge>;
        }
    };

    if (pendingLoading && !pendingData) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-2 max-w-[400px] gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <DashboardCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    const pendingRequests = pendingData?.approvalRequestsByManager || [];
    const historyRequests = historyData?.approvalRequestsByManager || [];

    return (
        <div className="container mx-auto py-6 space-y-6">

            <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {dict.approvalRequests.pending}
                        {pendingRequests.length > 0 && (
                            <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                                {pendingRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        {dict.approvalRequests.history}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6 space-y-4">
                    {pendingRequests.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">{dict.approvalRequests.noPendingRequests}</h3>
                                <p className="text-sm text-muted-foreground">{dict.approvalRequests.noPendingRequestsDescription}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingRequests.map((request: any) => (
                                <Card key={request.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {request.employee.firstName} {request.employee.lastName}
                                                </CardTitle>
                                                <CardDescription>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium">{request.type}</span>
                                                        <span>
                                                            {format(new Date(request.dateFrom), 'PPP')} - {format(new Date(request.dateTo), 'PPP')}
                                                        </span>
                                                        {request.type === 'Overtime' && request.hours && (
                                                            <span className="text-xs">
                                                                {dict.approvalRequests.hours}: {request.hours}h
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="default" disabled={approving || rejecting}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            {dict.approvalRequests.approve}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{dict.approvalRequests.approveConfirm}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {request.employee.firstName} {request.employee.lastName} - {request.type}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleApprove(request.id)}>
                                                                {dict.approvalRequests.approve}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button size="sm" variant="destructive" disabled={approving || rejecting}>
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            {dict.approvalRequests.reject}
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>{dict.approvalRequests.rejectConfirm}</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                {request.employee.firstName} {request.employee.lastName} - {request.type}
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>{dict.common.cancel}</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleReject(request.id)}>
                                                                {dict.approvalRequests.reject}
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {request.note && (
                                        <CardContent>
                                            <div className="text-sm">
                                                <span className="font-medium">{dict.approvalRequests.note}:</span> {request.note}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="mt-6 space-y-4">
                    {historyLoading ? (
                        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <DashboardCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : historyRequests.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <History className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">{dict.approvalRequests.noHistoryRequests}</h3>
                                <p className="text-sm text-muted-foreground">{dict.approvalRequests.noHistoryRequestsDescription}</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {historyRequests.map((request: any) => (
                                <Card key={request.id} className="opacity-90 hover:opacity-100 transition-opacity">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-lg">
                                                    {request.employee.firstName} {request.employee.lastName}
                                                </CardTitle>
                                                <CardDescription>
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium">{request.type}</span>
                                                        <span>
                                                            {format(new Date(request.dateFrom), 'PPP')} - {format(new Date(request.dateTo), 'PPP')}
                                                        </span>
                                                        {request.type === 'Overtime' && request.hours && (
                                                            <span className="text-xs">
                                                                {dict.approvalRequests.hours}: {request.hours}h
                                                            </span>
                                                        )}
                                                    </div>
                                                </CardDescription>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(request.status)}
                                                <span className="text-xs text-muted-foreground">
                                                    {request.updatedAt ? format(new Date(request.updatedAt), 'PPP') : '-'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {request.note && (
                                        <CardContent>
                                            <div className="text-sm">
                                                <span className="font-medium">{dict.approvalRequests.note}:</span> {request.note}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
