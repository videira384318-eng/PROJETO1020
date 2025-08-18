
"use client";

import { useState, useMemo } from 'react';
import { LogIn, LogOut, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from './ui/input';
import type { VehicleLog } from '@/types';

interface VehicleLogHistoryProps {
  logs: VehicleLog[];
}

export function VehicleLogHistory({ logs }: VehicleLogHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    if (!searchTerm) {
      return logs;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return logs.filter(log =>
      (log.vehiclePlate && log.vehiclePlate.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (log.vehicleModel && log.vehicleModel.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (log.driverName && log.driverName.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [logs, searchTerm]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Histórico de Movimentações</CardTitle>
                <CardDescription>Um registro de todas as entradas e saídas de veículos.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Pesquisar no histórico..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Pátio</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredLogs.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        {searchTerm ? 'Nenhum registro encontrado.' : 'Nenhum registro de movimentação ainda.'}
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell className="font-medium font-mono">{log.vehiclePlate}</TableCell>
                            <TableCell>{log.vehicleModel}</TableCell>
                            <TableCell>{log.driverName}</TableCell>
                            <TableCell>{log.parkingLot}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(log.entryTimestamp).toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {log.exitTimestamp ? new Date(log.exitTimestamp).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={log.status === 'entered' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit">
                                    {log.status === 'entered' ? <LogIn size={14}/> : <LogOut size={14}/>}
                                    {log.status === 'entered' ? 'Entrada' : 'Saída'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
