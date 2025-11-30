'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/providers/auth-provider';
import { GET_APPROVAL_REQUESTS_BY_MANAGER } from '@/graphql/queries/approval-requests';
import { APPROVE_REQUEST, REJECT_REQUEST } from '@/graphql/mutations/approval-requests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FileText, CheckCircle, XCircle } from 'lucide-react';
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
        hours: string;
    };
    common: {
        loading: string;
        cancel: string;
    };
}

export default function ApprovalsPage({ dict }: { dict: Dictionary }) {
    const { user } = useAuth();

    const { data, loading, refetch } = useQuery(GET_APPROVAL_REQUESTS_BY_MANAGER, {
        variables: { managerId: user?.id },
        skip: !user?.id,
    });

    const [approveRequest, { loading: approving }] = useMutation(APPROVE_REQUEST, {
        onCompleted: () => {
            toast.success(dict.approvalRequests.successApprove);
            refetch();
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
            refetch();
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">{dict.common.loading}</div>
            </div>
        );
    }

    const requests = data?.approvalRequestsByManager || [];

    return (
        <div className="container mx-auto py-6 space-y-6">

            {requests.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{dict.approvalRequests.noPendingRequests}</h3>
                        <p className="text-sm text-muted-foreground">{dict.approvalRequests.noPendingRequestsDescription}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request: any) => (
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
        </div>
    );
}
