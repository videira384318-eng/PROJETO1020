"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search, LogIn, LogOut } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import type { VisitorFormData } from '@/app/visitantes/page';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface VisitorListProps {
  visitors: VisitorFormData[];
  onDelete: (visitorId: string) => void;
  onEnter: (visitorId: string) => void;
  onExit: (visitorId: string) => void;
  onVisitorClick: (visitor: VisitorFormData) => void;
}

export function VisitorList({ visitors, onDelete, onEnter, onExit, onVisitorClick }: VisitorListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedVisitors = useMemo(() => {
    // Show visitors who are 'inside' or 'registered' first, then 'exited'
    return [...visitors].sort((a, b) => {
        const statusOrder = { 'inside': 1, 'registered': 2, 'exited': 3 };
        const statusA = statusOrder[a.status!] || 4;
        const statusB = statusOrder[b.status!] || 4;
        if (statusA !== statusB) {
            return statusA - statusB;
        }
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
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
      visitor.responsavel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.placa && visitor.placa.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sortedVisitors, searchTerm]);
  
  const getStatusBadge = (status: VisitorFormData['status']) => {
    switch (status) {
      case 'inside':
        return <Badge variant="success">Dentro</Badge>;
      case 'exited':
        return <Badge variant="destructive">Saiu</Badge>;
      case 'registered':
      default:
        return <Badge variant="outline">Registrado</Badge>;
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Visitantes Cadastrados</CardTitle>
                <CardDescription>Gerencie a entrada e saída dos visitantes.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Pesquisar..." 
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
            <p className="font-semibold">Nenhum visitante cadastrado</p>
            <p className="text-sm">Use o formulário para adicionar o primeiro.</p>
          </div>
        ) : filteredVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente.</p>
            </div>
        ) : (
          <div className="border rounded-md text-xs">
            <TooltipProvider>
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
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredVisitors.map((visitor) => (
                    <TableRow 
                        key={visitor.id} 
                        onClick={() => onVisitorClick(visitor)}
                        className={visitor.status === 'exited' ? 'opacity-60' : 'cursor-pointer'}
                    >
                        <TableCell className="font-medium">{visitor.nome}</TableCell>
                        <TableCell>{visitor.rg}</TableCell>
                        <TableCell>{visitor.cpf}</TableCell>
                        <TableCell>{visitor.empresa}</TableCell>
                        <TableCell>{visitor.placa || 'N/A'}</TableCell>
                        <TableCell>{visitor.responsavel}</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                            <Tooltip>
                                <TooltipTrigger>
                                    <span className="block truncate">{visitor.motivo}</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{visitor.motivo}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
                        <TableCell>{visitor.portaria.toUpperCase()}</TableCell>
                        <TableCell>{getStatusBadge(visitor.status)}</TableCell>
                        <TableCell className="text-right space-x-1">
                           {visitor.status === 'registered' && (
                             <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); onEnter(visitor.id!); }}>
                                <LogIn className="h-3 w-3 mr-1" /> Entrada
                             </Button>
                           )}
                           {visitor.status === 'inside' && (
                             <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); onExit(visitor.id!); }}>
                                <LogOut className="h-3 w-3 mr-1" /> Saída
                             </Button>
                           )}
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={visitor.status === 'inside'} onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Excluir Visitante</span>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro do visitante.
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
            </TooltipProvider>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
