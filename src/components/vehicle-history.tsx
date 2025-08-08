
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Search, History, Truck, LogIn, LogOut, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { VehicleLogEntry } from '@/app/veiculos/page';
import { Badge } from './ui/badge';
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
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface VehicleHistoryProps {
  log: VehicleLogEntry[];
  onEdit: (logEntry: VehicleLogEntry) => void;
  onDelete: (logId: string) => void;
  canManage: boolean;
}

function translateScanType(scanType: 'entry' | 'exit') {
  return scanType === 'entry' ? 'Entrada' : 'Saída';
}

export function VehicleHistory({ log, onEdit, onDelete, canManage }: VehicleHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedLog = useMemo(() => {
    return [...log].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [log]);

  const filteredLog = useMemo(() => {
    if (!searchTerm) {
      return sortedLog;
    }
    return sortedLog.filter(entry =>
      entry.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.condutor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedLog, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline flex items-center gap-2"><History className="w-6 h-6"/> Histórico de Movimentação</CardTitle>
                <CardDescription>Consulte e edite todos os registros de entrada e saída.</CardDescription>
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
        {log.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <Truck className="h-10 w-10 mb-4" />
            <p className="font-semibold">Nenhum registro no histórico</p>
            <p className="text-sm">As movimentações de veículos aparecerão aqui.</p>
          </div>
        ) : filteredLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente.</p>
            </div>
        ) : (
          <div className="border rounded-md">
            <TooltipProvider>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Placa</TableHead>
                            <TableHead>Condutor</TableHead>
                            <TableHead>Portaria</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Data e Hora</TableHead>
                            {canManage && <TableHead className="text-right">Ações</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLog.map((entry) => (
                        <TableRow key={entry.logId}>
                            <TableCell className="font-medium">{entry.placa}</TableCell>
                            <TableCell>{entry.condutor}</TableCell>
                            <TableCell>{entry.portaria.toUpperCase()}</TableCell>
                            <TableCell>
                                <Badge variant={entry.type === 'entry' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit">
                                    {entry.type === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                                    {translateScanType(entry.type)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{new Date(entry.timestamp).toLocaleString('pt-BR')}</TableCell>
                            {canManage && (
                                <TableCell className="text-right">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(entry)}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Editar Registro</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Editar Registro</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Excluir Registro do Histórico</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente este registro de movimentação, mas não o cadastro do veículo.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(entry.logId)}>Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            )}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TooltipProvider>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
