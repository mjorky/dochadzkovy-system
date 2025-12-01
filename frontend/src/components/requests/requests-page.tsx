'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/providers/auth-provider';
import { GET_APPROVAL_REQUESTS_BY_EMPLOYEE } from '@/graphql/queries/approval-requests';
import { CREATE_APPROVAL_REQUEST } from '@/graphql/mutations/approval-requests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

interface Dictionary {
    approvalRequests: {
        title: string;
        newRequest: string;
        type: string;
        dateFrom: string;
        dateTo: string;
        status: string;
        createdAt: string;
        note: string;
        approver: string;
        noRequests: string;
        noRequestsDescription: string;
        pending: string;
        approved: string;
        rejected: string;
        createRequest: string;
        createRequestDescription: string;
        selectType: string;
        vacation: string;
        sickLeave: string;
        overtime: string;
        enterNote: string;
        hours: string;
        successCreate: string;
        errorCreate: string;
    };
    common: {
        loading: string;
        save: string;
        cancel: string;
    };
}

export default function RequestsPage({ dict }: { dict: Dictionary }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: '',
        dateFrom: undefined as Date | undefined,
        dateTo: undefined as Date | undefined,
        hours: '',
        note: '',
    });

    const { data, loading, refetch } = useQuery(GET_APPROVAL_REQUESTS_BY_EMPLOYEE, {
        variables: { employeeId: user?.id },
        skip: !user?.id,
    });

    const [createRequest, { loading: creating }] = useMutation(CREATE_APPROVAL_REQUEST, {
        onCompleted: () => {
            toast.success(dict.approvalRequests.successCreate);
            setOpen(false);
            setFormData({
                type: '',
                dateFrom: undefined,
                dateTo: undefined,
                hours: '',
                note: '',
            });
            refetch();
        },
        onError: (error: Error) => {
            toast.error(dict.approvalRequests.errorCreate, {
                description: error.message,
            });
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.type || !formData.dateFrom || !formData.dateTo) {
            return;
        }

        await createRequest({
            variables: {
                input: {
                    employeeId: user?.id,
                    type: formData.type,
                    dateFrom: formData.dateFrom,
                    dateTo: formData.dateTo,
                    hours: formData.type === 'Overtime' ? parseFloat(formData.hours) : undefined,
                    note: formData.note || undefined,
                },
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; className: string }> = {
            PENDING: { label: dict.approvalRequests.pending, className: 'bg-yellow-100 text-yellow-800' },
            APPROVED: { label: dict.approvalRequests.approved, className: 'bg-green-100 text-green-800' },
            REJECTED: { label: dict.approvalRequests.rejected, className: 'bg-red-100 text-red-800' },
        };

        const statusInfo = statusMap[status] || statusMap.PENDING;

        return (
            <span className={cn('px-2 py-1 rounded-full text-xs font-medium', statusInfo.className)}>
                {statusInfo.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground">{dict.common.loading}</div>
            </div>
        );
    }

    const requests = data?.approvalRequestsByEmployee || [];

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            {dict.approvalRequests.newRequest}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{dict.approvalRequests.createRequest}</DialogTitle>
                            <DialogDescription>
                                {dict.approvalRequests.createRequestDescription}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>{dict.approvalRequests.type}</Label>
                                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={dict.approvalRequests.selectType} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Dovolenka">{dict.approvalRequests.vacation}</SelectItem>
                                        <SelectItem value="PN">{dict.approvalRequests.sickLeave}</SelectItem>
                                        <SelectItem value="Overtime">{dict.approvalRequests.overtime}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>{dict.approvalRequests.dateFrom}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.dateFrom && 'text-muted-foreground')}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.dateFrom ? format(formData.dateFrom, 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar 
                                                mode="single" 
                                                selected={formData.dateFrom} 
                                                onSelect={(date) => setFormData({ ...formData, dateFrom: date })} 
                                                initialFocus 
                                                showTodayButton
                                                todayButtonLabel={dict.common?.today || "Today"}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="space-y-2">
                                    <Label>{dict.approvalRequests.dateTo}</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !formData.dateTo && 'text-muted-foreground')}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.dateTo ? format(formData.dateTo, 'PPP') : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar 
                                                mode="single" 
                                                selected={formData.dateTo} 
                                                onSelect={(date) => setFormData({ ...formData, dateTo: date })} 
                                                initialFocus 
                                                showTodayButton
                                                todayButtonLabel={dict.common?.today || "Today"}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            {formData.type === 'Overtime' && (
                                <div className="space-y-2">
                                    <Label>{dict.approvalRequests.hours}</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        value={formData.hours}
                                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                        placeholder="8"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>{dict.approvalRequests.note}</Label>
                                <Textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder={dict.approvalRequests.enterNote}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                    {dict.common.cancel}
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating ? dict.common.loading : dict.common.save}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {requests.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{dict.approvalRequests.noRequests}</h3>
                        <p className="text-sm text-muted-foreground">{dict.approvalRequests.noRequestsDescription}</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((request: any) => (
                        <Card key={request.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{request.type}</CardTitle>
                                        <CardDescription>
                                            {format(new Date(request.dateFrom), 'PPP')} - {format(new Date(request.dateTo), 'PPP')}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(request.status)}
                                </div>
                            </CardHeader>
                            {request.note && (
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">{request.note}</p>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
