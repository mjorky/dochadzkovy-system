'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@/providers/auth-provider';
import {
  GET_OVERTIME_SUMMARY,
  CREATE_OVERTIME_CORRECTION,
  OvertimeSummaryData,
} from '@/graphql/queries/overtime';
import { EmployeeSelector } from '@/components/employee-selector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const OVERTIME_TYPES = [
  { id: 'Flexi', label: 'Flexi' },
  { id: 'SCSKCesta', label: 'SC SR Cesta' },
  { id: 'SCZahranicie', label: 'SC Zahraničie' },
  { id: 'Neplateny', label: 'Neplatené' },
];

export default function OvertimePage() {
  const { user, loading: authLoading } = useAuth();
  const canManage = !!user?.isAdmin || !!user?.isManager;
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  
  // Form State
  const [selectedType, setSelectedType] = useState<string>('Flexi');
  const [correctionMode, setCorrectionMode] = useState<'add' | 'subtract'>('subtract'); // Default subtract (odpocet)
  const [hoursValue, setHoursValue] = useState<string>('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [note, setNote] = useState<string>('');

  // Initialize employee ID
  useEffect(() => {
    if (user?.id && !selectedEmployeeId) {
      setSelectedEmployeeId(user.id);
    }
  }, [user, selectedEmployeeId]);

  // Queries
  const { data, loading, error, refetch } = useQuery<OvertimeSummaryData>(GET_OVERTIME_SUMMARY, {
    variables: {
      employeeId: parseInt(selectedEmployeeId || '0', 10),
      year,
    },
    skip: !selectedEmployeeId,
    fetchPolicy: 'network-only',
  });

  // Mutations
  const [createCorrection, { loading: submitting }] = useMutation(CREATE_OVERTIME_CORRECTION, {
    onCompleted: () => {
      toast.success('Overtime correction saved successfully');
      setHoursValue('');
      setNote('');
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to save correction: ${err.message}`);
    },
  });

  // Handlers
  const handleRowClick = (type: string) => {
    setSelectedType(type);
    // Auto-select mode based on current balance?
    // Prompt says: "Odpočítať (default if positive)", "Pripočítať (default if negative/zero)"
    const currentBalance = data?.getOvertimeSummary.items.find(i => i.type === type)?.hours || 0;
    if (currentBalance > 0) {
        setCorrectionMode('subtract');
    } else {
        setCorrectionMode('add');
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmployeeId) return;
    if (!hoursValue || isNaN(parseFloat(hoursValue))) {
        toast.error('Please enter a valid number of hours');
        return;
    }
    if (!date) {
        toast.error('Please select a date');
        return;
    }

    const hours = parseFloat(hoursValue);
    
    await createCorrection({
        variables: {
            input: {
                employeeId: parseInt(selectedEmployeeId, 10),
                date: date, // Apollo handles Date serialization usually, or ISO string
                type: selectedType,
                hours: hours,
                note: note,
                isDeduction: correctionMode === 'subtract'
            }
        }
    });
  };

  // Calculations for preview
  const currentBalance = data?.getOvertimeSummary.items.find(i => i.type === selectedType)?.hours || 0;
  const inputHours = parseFloat(hoursValue) || 0;
  const predictedBalance = correctionMode === 'add' 
    ? currentBalance + inputHours 
    : currentBalance - inputHours;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Overtime Management</h1>
        <p className="text-muted-foreground">
          Manage and correct overtime hours for employees.
        </p>
      </div>

      <Separator />

      {/* Employee Selector */}
      <div className="max-w-md">
        <EmployeeSelector
            currentEmployeeId={selectedEmployeeId}
            onEmployeeChange={setSelectedEmployeeId}
            isAdmin={!!user?.isAdmin}
            isManager={!!user?.isManager}
        />
      </div>

      <div className={cn("grid gap-8", canManage ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 max-w-4xl mx-auto")}>
        
        {/* Left Column: Summary Table */}
        <Card className="h-fit">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Overtime Summary ({year})</span>
                    <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={loading}>
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                </CardTitle>
                <CardDescription>Click on a row to adjust that type.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Balance [h]</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && !data ? (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                OVERTIME_TYPES.map((type) => {
                                    const item = data?.getOvertimeSummary.items.find(i => i.type === type.id);
                                    const balance = item?.hours || 0;
                                    const isSelected = selectedType === type.id;
                                    
                                    return (
                                        <TableRow 
                                            key={type.id} 
                                            className={cn("cursor-pointer transition-colors", isSelected && "bg-muted")}
                                            onClick={() => handleRowClick(type.id)}
                                        >
                                            <TableCell className="font-medium">
                                                {type.label}
                                                {isSelected && <span className="ml-2 text-xs text-primary">(Selected)</span>}
                                            </TableCell>
                                            <TableCell className={cn("text-right font-bold", balance < 0 ? "text-destructive" : "text-green-600")}>
                                                {balance.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        {/* Right Column: Adjustment Form */}
        {canManage && (
        <Card>
            <CardHeader>
                <CardTitle>Correction: {OVERTIME_TYPES.find(t => t.id === selectedType)?.label}</CardTitle>
                <CardDescription>Manually adjust hours for the selected type.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Mode Selection */}
                <RadioGroup 
                    value={correctionMode} 
                    onValueChange={(v) => setCorrectionMode(v as 'add' | 'subtract')}
                    className="flex gap-4"
                >
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="subtract" id="subtract" />
                        <Label htmlFor="subtract" className="cursor-pointer font-medium">Subtract (Odpočítať)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="add" id="add" />
                        <Label htmlFor="add" className="cursor-pointer font-medium">Add (Pripočítať)</Label>
                    </div>
                </RadioGroup>

                <div className="grid grid-cols-2 gap-4">
                    {/* Hours Input */}
                    <div className="space-y-2">
                        <Label>Hours</Label>
                        <Input 
                            type="number" 
                            step="0.5" 
                            placeholder="e.g. 1.5" 
                            value={hoursValue}
                            onChange={(e) => setHoursValue(e.target.value)}
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Balance Preview */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Balance:</span>
                        <span>{currentBalance.toFixed(2)} h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Adjustment:</span>
                        <span className={correctionMode === 'add' ? "text-green-600" : "text-destructive"}>
                            {correctionMode === 'add' ? '+' : '-'}{inputHours.toFixed(2)} h
                        </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                        <span>New Balance:</span>
                        <span className={predictedBalance < 0 ? "text-destructive" : "text-green-600"}>
                            {predictedBalance.toFixed(2)} h
                        </span>
                    </div>
                </div>

                {/* Note */}
                <div className="space-y-2">
                    <Label>Note (Reason)</Label>
                    <Textarea 
                        placeholder="e.g. Paid out 10h overtime..." 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                {/* Action Button */}
                <Button 
                    className="w-full gap-2" 
                    onClick={handleSubmit} 
                    disabled={submitting || !selectedEmployeeId || !hoursValue}
                    variant={correctionMode === 'subtract' ? "destructive" : "default"}
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {correctionMode === 'subtract' ? 'Subtract Hours' : 'Add Hours'}
                </Button>

            </CardContent>
        </Card>
        )}

      </div>
    </div>
  );
}