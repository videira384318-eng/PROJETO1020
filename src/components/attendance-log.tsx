"use client";

import { LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';

interface AttendanceLogProps {
  scans: AttendanceScan[];
}

function translateScanType(scanType: 'entry' | 'exit') {
  return scanType === 'entry' ? 'Entrada' : 'Saída';
}

export function AttendanceLog({ scans }: AttendanceLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Registro de Ponto</CardTitle>
        <CardDescription>Um registro em tempo real de todos os escaneamentos de entrada e saída.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-fit">Tipo</TableHead>
                <TableHead>ID do Funcionário</TableHead>
                <TableHead className="text-right">Horário</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {scans.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    Nenhum registro ainda.
                    </TableCell>
                </TableRow>
                )}
                {scans.map((scan) => (
                <TableRow key={scan.scanId}>
                    <TableCell>
                    <Badge variant={scan.scanType === 'entry' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1.5 w-fit">
                        {scan.scanType === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                        {translateScanType(scan.scanType)}
                    </Badge>
                    </TableCell>
                    <TableCell className="font-mono">{scan.employeeId}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{new Date(scan.scanTime).toLocaleString()}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
