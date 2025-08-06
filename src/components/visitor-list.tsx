"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search, LogIn, LogOut, Edit } from 'lucide-react';
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
import { Checkbox } from './ui/checkbox';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ReEntryDialog } from './re-entry-dialog';
import { useAuth } from '@/contexts/auth-context';


interface VisitorListProps {
  visitors: VisitorFormData[];
  selectedVisitors: string[];
  numSelected: number;
  numTotal: number;
  onDelete: (personId: string) => void;
  onVisitorClick: (visitor: VisitorFormData) => void;
  onToggleSelection: (personId: string) => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
}

export function VisitorList({ 
  visitors,
  selectedVisitors,
  numSelected,
  numTotal,
  onDelete, 
  onVisitorClick,
  onToggleSelection,
  onToggleSelectAll,
  onDeleteSelected
}: VisitorListProps) {
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedVisitors = useMemo(() => {
    // Show visitors who are 'inside' or 'registered' first, then 'exited'
    return [...visitors].sort((a, b) => {
        const statusOrder = { 'inside': 1, 'exited': 2 };
        const statusA = statusOrder[a.status!] || 3;
        const statusB = statusOrder[b.status!] || 3;
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
        return <Badge variant="destructive">Fora</Badge>;
      default:
        return <Badge variant="outline">Registrado</Badge>;
    }
  }

  const getActionTooltip = (status: VisitorFormData['status']) => {
    switch (status) {
        case 'inside':
            return 'Registrar Saída';
        case 'exited':
            return 'Registrar Nova Entrada';
        default:
            return '';
    }
  }
  
  const getActionIcon = (status: VisitorFormData['status']) => {
     switch (status) {
        case 'inside':
            return <LogOut className="h-4 w-4" />;
        case 'exited':
            return <LogIn className="h-4 w-4" />;
        default:
            return null;
    }
  }

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const canPerformActions = role === 'adm' || role === 'portaria';
  const canDelete = role === 'adm';

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Visitantes Atuais</CardTitle>
                <CardDescription>Clique em um visitante para registrar entrada/saída.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {canDelete && numSelected > 0 && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir ({numSelected})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente os {numSelected} visitante(s) selecionado(s) e todos os seus registros.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteSelected}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              )}
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
                    {canDelete && (
                        <TableHead className="w-[40px]">
                            <Checkbox 
                            checked={numTotal > 0 && numSelected === numTotal}
                            indeterminate={numSelected > 0 && numSelected < numTotal}
                            onCheckedChange={onToggleSelectAll}
                            />
                        </TableHead>
                    )}
                    <TableHead>Nome</TableHead>
                    <TableHead>RG</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Portaria</TableHead>
                    <TableHead>Status</TableHead>
                    {canPerformActions && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredVisitors.map((visitor) => (
                         <TableRow 
                            key={visitor.id}
                            data-state={selectedVisitors.includes(visitor.personId!) ? 'selected' : ''}
                            onClick={() => canPerformActions && onVisitorClick(visitor)}
                            className={canPerformActions ? "cursor-pointer" : "cursor-default"}
                        >
                            {canDelete && (
                                <TableCell onClick={stopPropagation}>
                                    <Checkbox
                                        checked={selectedVisitors.includes(visitor.personId!)}
                                        onCheckedChange={() => onToggleSelection(visitor.personId!)}
                                    />
                                </TableCell>
                            )}
                            <TableCell className="font-medium">{visitor.nome}</TableCell>
                            <TableCell>{visitor.rg}</TableCell>
                            <TableCell>{visitor.cpf}</TableCell>
                            <TableCell>{visitor.empresa}</TableCell>
                            <TableCell>{visitor.placa || 'N/A'}</TableCell>
                            <TableCell>{visitor.responsavel}</TableCell>
                            <TableCell className="max-w-[150px]">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                         <span className="block truncate">{visitor.motivo}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{visitor.motivo}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TableCell>
                            <TableCell>{visitor.portaria.toUpperCase()}</TableCell>
                            <TableCell>{getStatusBadge(visitor.status)}</TableCell>
                            {canPerformActions && (
                                <TableCell className="text-right space-x-1" onClick={stopPropagation}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7"
                                                onClick={() => onVisitorClick(visitor)}
                                            >
                                            {getActionIcon(visitor.status)}
                                            <span className="sr-only">{getActionTooltip(visitor.status)}</span>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{getActionTooltip(visitor.status)}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                {canDelete && (
                                    <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7"
                                            disabled={visitor.status === 'inside'}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Excluir Visitante</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Essa ação não pode ser desfeita. Isso excluirá permanentemente todos os registros deste visitante.
                                        </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(visitor.personId!)}>Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                    </AlertDialog>
                                )}
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
