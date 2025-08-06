"use client";

import { LogIn, LogOut, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';
import { Button } from './ui/button';

interface AttendanceLogProps {
  scans: AttendanceScan[];
  onClear: () => void;
}

function translateScanType(scanType: 'entry' | 'exit') {
  return scanType === 'entry' ? 'Entrada' : 'Saída';
}

export function AttendanceLog({ scans, onClear }: AttendanceLogProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Registro de Ponto</CardTitle>
                <CardDescription>Um registro em tempo real de todos os escaneamentos.</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClear} disabled={scans.length === 0}>
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Limpar Histórico</span>
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
                <TableHead className="text-right">Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {scans.length === 0 && (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhum registro ainda.
                    </TableCell>
                </TableRow>
                )}
                {scans.map((scan) => (
                <TableRow key={scan.scanId}>
                    <TableCell className="font-medium">{scan.employeeId}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(scan.scanTime).toLocaleDateString()}</TableCell>
                    <TableCell className="text-muted-foreground">{new Date(scan.scanTime).toLocaleTimeString()}</TableCell>
                    <TableCell className="text-right">
                        <Badge variant={scan.scanType === 'entry' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1.5 w-fit ml-auto">
                            {scan.scanType === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                            {translateScanType(scan.scanType)}
                        </Badge>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
