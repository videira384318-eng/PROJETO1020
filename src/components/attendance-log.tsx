"use client";

import { LogIn, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';

interface AttendanceLogProps {
  scans: AttendanceScan[];
}

export function AttendanceLog({ scans }: AttendanceLogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Attendance Log</CardTitle>
        <CardDescription>A real-time log of all entry and exit scans.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-fit">Type</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {scans.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No scans yet.
                    </TableCell>
                </TableRow>
                )}
                {scans.map((scan) => (
                <TableRow key={scan.scanId}>
                    <TableCell>
                    <Badge variant={scan.scanType === 'entry' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1.5 w-fit">
                        {scan.scanType === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                        {scan.scanType}
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
