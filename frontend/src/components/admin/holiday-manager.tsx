"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "@/contexts/dictionary-context";
import { useQuery, useMutation } from "@apollo/client/react";
import {
    GET_HOLIDAYS,
    ADD_HOLIDAY,
    UPDATE_HOLIDAY,
    DELETE_HOLIDAY,
    type Holiday,
} from "@/graphql/queries/holidays";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Trash2,
    Edit2,
    Loader2,
    CalendarIcon,
    ChevronUp,
    ChevronDown,
    Calendar as CalendarIconLucide
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { sk, enUS } from "date-fns/locale";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface HolidaysQueryData {
    holidays: Holiday[];
}

// --- HELPER COMPONENT FOR HEADER ---
interface ColumnSortHeaderProps {
    title: string;
    isSortable?: boolean;
    sortDirection?: "asc" | "desc" | null;
    onSort?: () => void;
}

function ColumnSortHeader({
    title,
    isSortable,
    sortDirection,
    onSort,
}: ColumnSortHeaderProps) {
    return (
        <div className="flex items-center space-x-1">
            {isSortable ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium text-muted-foreground hover:text-foreground data-[state=open]:bg-accent"
                    onClick={onSort}
                >
                    <span>{title}</span>
                    {sortDirection === "asc" && (
                        <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" />
                    )}
                    {sortDirection === "desc" && (
                        <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />
                    )}
                </Button>
            ) : (
                <span className="text-sm font-medium text-muted-foreground">
                    {title}
                </span>
            )}
        </div>
    );
}

export function HolidayManager({ lang }: { lang: string }) {
    const t = useTranslations();

    // State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
    const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

    // Sorting State
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // GraphQL
    const { data, loading, error, refetch } = useQuery<HolidaysQueryData>(GET_HOLIDAYS);

    const [addHoliday, { loading: isAdding }] = useMutation(ADD_HOLIDAY, {
        onCompleted: () => {
            toast.success(t.holidays?.successCreate || t.common.success); // Fallback ak preklad chýba
            setIsCreateOpen(false);
            setSelectedDate(undefined);
            refetch();
        },
        onError: () => toast.error(t.common.error),
    });

    const [updateHoliday, { loading: isUpdating }] = useMutation(UPDATE_HOLIDAY, {
        onCompleted: () => {
            toast.success(t.holidays?.successUpdate || t.common.success);
            setIsEditOpen(false);
            setEditingHoliday(null);
            setSelectedDate(undefined);
            refetch();
        },
        onError: () => toast.error(t.common.error),
    });

    const [deleteHoliday, { loading: isDeleting }] = useMutation(DELETE_HOLIDAY, {
        onCompleted: () => {
            toast.success(t.holidays?.successDelete || t.common.success);
            setIsDeleteOpen(false);
            setHolidayToDelete(null);
            refetch();
        },
        onError: () => toast.error(t.common.error),
    });

    // Handlers
    const handleSort = () => {
        setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    };

    const handleCreate = () => {
        if (!selectedDate) return;
        const dateToSend = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            12, 0, 0
        ));
        addHoliday({ variables: { date: dateToSend } });
    };

    const handleUpdate = () => {
        if (!selectedDate || !editingHoliday) return;
        const dateToSend = new Date(Date.UTC(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            12, 0, 0
        ));
        updateHoliday({
            variables: {
                oldDate: editingHoliday.Den,
                newDate: dateToSend,
            },
        });
    };

    const handleDelete = () => {
        if (!holidayToDelete) return;
        deleteHoliday({ variables: { date: holidayToDelete.Den } });
    };

    const openEditDialog = (holiday: Holiday) => {
        setEditingHoliday(holiday);
        setSelectedDate(parseISO(holiday.Den));
        setIsEditOpen(true);
    };

    const openDeleteDialog = (holiday: Holiday) => {
        setHolidayToDelete(holiday);
        setIsDeleteOpen(true);
    };

    // Sorted Data Logic
    const holidays = data?.holidays || [];
    const sortedHolidays = useMemo(() => {
        const sorted = [...holidays];
        sorted.sort((a, b) => {
            const dateA = new Date(a.Den).getTime();
            const dateB = new Date(b.Den).getTime();
            return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        });
        return sorted;
    }, [holidays, sortDirection]);

    const dateLocale = lang === "sk" ? sk : enUS;

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return <div className="text-destructive p-4">{t.common.error}</div>;
    }

    return (
        <div className="space-y-4">
            {/* Hlavná karta (obal) */}
            <Card className="bg-card border-border shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CalendarIconLucide className="w-5 h-5 text-muted-foreground" />
                            <div className="space-y-1">
                                <CardTitle>{t.data.holidays || "Holidays"}</CardTitle>
                                <CardDescription>
                                    {t.data.description || "Manage system holidays."}
                                </CardDescription>
                            </div>
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            {t.common.create || "Add"}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Scrollable Table Container */}
                    <div className="rounded-md border border-border max-h-[500px] overflow-y-auto relative bg-background flex flex-col">
                        <Table>
                            <TableHeader className="sticky top-0 bg-muted/90 backdrop-blur-sm z-10 shadow-sm">
                                <TableRow className="hover:bg-transparent border-border">
                                    <TableHead className="w-[200px]">
                                        <ColumnSortHeader
                                            title={t.workRecordDialog.date || "Date"}
                                            isSortable={true}
                                            sortDirection={sortDirection}
                                            onSort={handleSort}
                                        />
                                    </TableHead>
                                    <TableHead className="text-right pr-6">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {t.common.actions || "Actions"}
                                        </span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedHolidays.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            {t.table.noResults || "No holidays found."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sortedHolidays.map((holiday) => (
                                        <TableRow
                                            key={holiday.Den}
                                            className="hover:bg-muted/60 active:bg-muted transition-colors border-border group"
                                        >
                                            <TableCell className="font-medium text-foreground/90 tabular-nums">
                                                {format(parseISO(holiday.Den), "d. MMMM yyyy", {
                                                    locale: dateLocale,
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                        onClick={() => openEditDialog(holiday)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                        <span className="sr-only">{t.common.edit}</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => openDeleteDialog(holiday)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span className="sr-only">{t.common.delete}</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {/* Table Footer */}
                        <div className="p-2 border-t border-border bg-muted/20 text-xs text-muted-foreground text-center">
                            {t.workRecords.showing} {sortedHolidays.length} {t.workRecords.records}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CREATE DIALOG */}
            <Dialog
                open={isCreateOpen}
                onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setSelectedDate(undefined);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.common.create} {t.data.holidays}</DialogTitle>
                        <DialogDescription>{t.workRecordDialog.fillDetails}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>{t.workRecordDialog.date}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal mt-2",
                                        !selectedDate && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, "PPP", { locale: dateLocale })
                                    ) : (
                                        <span>{t.workRecords.pickDate}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleCreate} disabled={!selectedDate || isAdding}>
                            {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.common.create}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT DIALOG */}
            <Dialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) {
                        setSelectedDate(undefined);
                        setEditingHoliday(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.common.edit}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>{t.workRecordDialog.date}</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal mt-2",
                                        !selectedDate && "text-muted-foreground",
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, "PPP", { locale: dateLocale })
                                    ) : (
                                        <span>{t.workRecords.pickDate}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleUpdate} disabled={!selectedDate || isUpdating}>
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.common.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE ALERT */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t.employees.deleteConfirmTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t.deleteDialog.cannotUndo}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setIsDeleteOpen(false)}>
                            {t.common.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.common.delete}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}