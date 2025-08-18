
"use client";

import { useState, useMemo } from 'react';
import { LogIn, LogOut, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from './ui/input';
import type { VisitLog } from '@/types';

interface VisitLogHistoryProps {
  visits: VisitLog[];
}

export function VisitLogHistory({ visits }: VisitLogHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisits = useMemo(() => {
    if (!searchTerm) {
      return visits;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return visits.filter(visit =>
      (visit.visitorName && visit.visitorName.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (visit.visitorCompany && visit.visitorCompany.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (visit.responsible && visit.responsible.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (visit.reason && visit.reason.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (visit.plate && visit.plate.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [visits, searchTerm]);


  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Histórico de Visitas</CardTitle>
                <CardDescription>Um registro de todas as entradas e saídas de visitantes.</CardDescription>
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
                    <TableHead>Visitante</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Pátio</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredVisits.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        {searchTerm ? 'Nenhum registro encontrado.' : 'Nenhum registro de visita ainda.'}
                        </TableCell>
                    </TableRow>
                ) : (
                    filteredVisits.map((visit) => (
                        <TableRow key={visit.id}>
                            <TableCell className="font-medium">{visit.visitorName}</TableCell>
                            <TableCell>{visit.visitorCompany}</TableCell>
                            <TableCell>{visit.responsible}</TableCell>
                            <TableCell>{visit.reason}</TableCell>
                            <TableCell>{visit.parkingLot}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(visit.entryTimestamp).toLocaleString()}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {visit.exitTimestamp ? new Date(visit.exitTimestamp).toLocaleString() : 'N/A'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={visit.status === 'entered' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit">
                                    {visit.status === 'entered' ? <LogIn size={14}/> : <LogOut size={14}/>}
                                    {visit.status === 'entered' ? 'Entrada' : 'Saída'}
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
