"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Search, History, Users, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { VisitorFormData } from '@/app/visitantes/page';
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

interface VisitorHistoryProps {
  visitors: VisitorFormData[];
  onDelete: (visitId: string) => void;
}

export function VisitorHistory({ visitors, onDelete }: VisitorHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedVisitors = useMemo(() => {
    return [...visitors].sort((a, b) => {
        const timeA = a.exitTime || a.entryTime || a.createdAt;
        const timeB = b.exitTime || b.entryTime || b.createdAt;
        return new Date(timeB!).getTime() - new Date(timeA!).getTime();
    });
  }, [visitors]);

  const filteredVisitors = useMemo(() => {
    if (!searchTerm) {
      return sortedVisitors;
    }
    return sortedVisitors.filter(visitor =>
      visitor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.rg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.placa && visitor.placa.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sortedVisitors, searchTerm]);
  
  const getStatusBadge = (status: VisitorFormData['status']) => {
    switch (status) {
      case 'inside':
        return <Badge variant="success">Dentro</Badge>;
      case 'exited':
        return <Badge variant="destructive">Saiu</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline flex items-center gap-2"><History className="w-6 h-6"/> Histórico de Visitas</CardTitle>
                <CardDescription>Consulte todos os registros de entrada e saída.</CardDescription>
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
        {visitors.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <Users className="h-10 w-10 mb-4" />
            <p className="font-semibold">Nenhum registro no histórico</p>
            <p className="text-sm">Os registros de entrada e saída aparecerão aqui.</p>
          </div>
        ) : filteredVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente.</p>
            </div>
        ) : (
          <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>RG</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Placa</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Portaria</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Entrada</TableHead>
                        <TableHead>Saída</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                        <TableCell className="font-medium">{visitor.nome}</TableCell>
                        <TableCell>{visitor.rg}</TableCell>
                        <TableCell>{visitor.cpf}</TableCell>
                        <TableCell>{visitor.empresa}</TableCell>
                        <TableCell>{visitor.placa || 'N/A'}</TableCell>
                        <TableCell>{visitor.responsavel}</TableCell>
                         <TableCell className="max-w-[150px] truncate">
                            <span className="block truncate">{visitor.motivo}</span>
                        </TableCell>
                        <TableCell>{visitor.portaria.toUpperCase()}</TableCell>
                        <TableCell>{getStatusBadge(visitor.status)}</TableCell>
                        <TableCell className="text-muted-foreground">{visitor.entryTime ? new Date(visitor.entryTime).toLocaleString('pt-BR') : '—'}</TableCell>
                        <TableCell className="text-muted-foreground">{visitor.exitTime ? new Date(visitor.exitTime).toLocaleString('pt-BR') : '—'}</TableCell>
                        <TableCell className="text-right">
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
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente este registro de visita, mas não o cadastro do visitante.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => onDelete(visitor.id!)}>Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
