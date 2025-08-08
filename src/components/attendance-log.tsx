
"use client";

import { useState, useMemo } from 'react';
import { LogIn, LogOut, Trash2, Calendar as CalendarIcon, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceScan } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
  getEmployeeNameById: (employeeId: string) => string;
  onDelete: (scanId: string) => void;
  onToggleCalendar: () => void;
  isCalendarOpen: boolean;
  canDelete: boolean;
}

function translateScanType(scanType: 'entry' | 'exit') {
  return scanType === 'entry' ? 'Entrada' : 'Saída';
}

export function AttendanceLog({ scans, getEmployeeNameById, onDelete, onToggleCalendar, isCalendarOpen, canDelete }: AttendanceLogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScans = useMemo(() => {
    if (!searchTerm) {
      return scans;
    }
    return scans.filter(scan =>
      getEmployeeNameById(scan.employeeId).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [scans, searchTerm, getEmployeeNameById]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Histórico</CardTitle>
                <CardDescription>Um registro de todos os escaneamentos.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Pesquisar por nome..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={onToggleCalendar} variant="outline" size="icon">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="sr-only">{isCalendarOpen ? 'Fechar Calendário' : 'Abrir Calendário'}</span>
                </Button>
            </div>
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
                {canDelete && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredScans.length === 0 && (
                <TableRow>
                    <TableCell colSpan={canDelete ? 7 : 6} className="h-24 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhum registro encontrado.' : 'Nenhum registro ainda.'}
                    </TableCell>
                </TableRow>
                )}
                {filteredScans.map((scan) => (
                    <TableRow key={scan.scanId}>
                        <TableCell className="font-medium">{getEmployeeNameById(scan.employeeId)}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(scan.scanTime).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(scan.scanTime).toLocaleTimeString()}</TableCell>
                        <TableCell className="text-muted-foreground">{scan.placa || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{scan.ramal || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={scan.scanType === 'entry' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit">
                                {scan.scanType === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                                {translateScanType(scan.scanType)}
                            </Badge>
                        </TableCell>
                        {canDelete && (<TableCell className="text-right">
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
                        </TableCell>)}
                    </TableRow>
                  )
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
