'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MonthPicker } from '@/components/ui/month-picker';
import { EmployeeSelector } from '@/components/employee-selector';
import { useTranslations } from '@/contexts/dictionary-context';

interface ReportConfigurationProps {
    selectedEmployeeId: string | null;
    onEmployeeChange: (id: string | null) => void;
    selectedMonth: Date;
    onMonthChange: (date: Date) => void;
    // Auth/Context props pre EmployeeSelector
    isAdmin?: boolean;
    isManager?: boolean;
}

export function ReportConfiguration({
    selectedEmployeeId,
    onEmployeeChange,
    selectedMonth,
    onMonthChange,
    isAdmin = false,
    isManager = false,
}: ReportConfigurationProps) {
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const t = useTranslations();

    const handleMonthSelect = (newDate: Date) => {
        // Vždy nastavíme na prvý deň v mesiaci pre konzistenciu
        const firstDay = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
        onMonthChange(firstDay);
        setIsMonthPickerOpen(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t.reports.configuration}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <EmployeeSelector
                    currentEmployeeId={selectedEmployeeId}
                    onEmployeeChange={onEmployeeChange}
                    isAdmin={isAdmin}
                    isManager={isManager}
                    placeholder={t.employees.selectEmployee}
                    label={t.employees.employee}
                />

                <div className="space-y-2">
                    <Label>{t.reports.monthYear}</Label>
                    <Popover open={isMonthPickerOpen} onOpenChange={setIsMonthPickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {selectedMonth ? (
                                    selectedMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })
                                ) : (
                                    <span>{t.reports.selectMonth}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <MonthPicker
                                selectedMonth={selectedMonth}
                                onMonthSelect={handleMonthSelect}
                                minDate={new Date(2020, 0)}
                                maxDate={new Date(new Date().getFullYear() + 1, 11)}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardContent>
        </Card>
    );
}