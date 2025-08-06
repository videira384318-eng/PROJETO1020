"use client";

import { LogIn, LogOut, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceScan } from '@/types';
import type { QrFormData } from './qr-generator';
import { Button } from './ui/button';
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
} from "@/components/ui/alert-dialog"

interface AttendanceLogProps {
  scans: AttendanceScan[];
  employees: QrFormData[];
  onDelete: (scanId: string) => void;
  onToggleCalendar: () => void;
  isCalendarOpen: boolean;
}

function translateScanType(scanType: 'entry' | 'exit') {
  return scanType === 'entry' ? 'Entrada' : 'Saída';
}

export function AttendanceLog({ scans, employees, onDelete, onToggleCalendar, isCalendarOpen }: AttendanceLogProps) {
  
  const getEmployeeDetails = (employeeId: string) => {
    const employee = employees.find(emp => `${emp.nome} (${emp.setor})` === employeeId);
    return {
      placa: employee?.placa || 'N/A',
      ramal: employee?.ramal || 'N/A',
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Histórico</CardTitle>
                <CardDescription>Um registro em tempo real de todos os escaneamentos.</CardDescription>
            </div>
            <Button onClick={onToggleCalendar} variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
                <span className="sr-only">{isCalendarOpen ? 'Fechar Calendário' : 'Abrir Calendário'}</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Ramal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {scans.length === 0 && (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Nenhum registro ainda.
                    </TableCell>
                </TableRow>
                )}
                {scans.map((scan) => {
                  const details = getEmployeeDetails(scan.employeeId);
                  return (
                    <TableRow key={scan.scanId}>
                        <TableCell className="font-medium">{scan.employeeId}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(scan.scanTime).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(scan.scanTime).toLocaleTimeString()}</TableCell>
                        <TableCell className="text-muted-foreground">{scan.placa || details.placa}</TableCell>
                        <TableCell className="text-muted-foreground">{scan.ramal || details.ramal}</TableCell>
                        <TableCell>
                            <Badge variant={scan.scanType === 'entry' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit">
                                {scan.scanType === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                                {translateScanType(scan.scanType)}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Excluir Registro</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro de ponto.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDelete(scan.scanId)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
