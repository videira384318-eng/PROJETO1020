
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, LogOut, LogIn } from 'lucide-react';
import type { VisitorWithStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from './ui/checkbox';
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface VisitorListProps {
  visitors: VisitorWithStatus[];
  onExit: (visitorId: string) => void;
  onRevisit: (visitorId: string) => void;
  selectedVisitors: string[];
  onToggleSelection: (visitorId: string) => void;
  onToggleSelectAll: (filteredVisitors: VisitorWithStatus[]) => void;
  onDeleteSelected: () => void;
}

export function VisitorList({ 
    visitors, 
    onExit,
    onRevisit,
    selectedVisitors,
    onToggleSelection,
    onToggleSelectAll,
    onDeleteSelected
}: VisitorListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisitors = useMemo(() => {
    return visitors
      .filter(visitor => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        if (!searchTerm) return true;

        const matchesSearch = 
          (visitor.name && visitor.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (visitor.rg && visitor.rg.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (visitor.cpf && visitor.cpf.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (visitor.company && visitor.company.toLowerCase().includes(lowerCaseSearchTerm));
          
        return matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [visitors, searchTerm]);

   const numSelected = selectedVisitors.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="font-headline">Cadastro de Visitantes</CardTitle>
            <CardDescription>Gerencie visitantes e registre novas visitas.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {numSelected > 0 && (
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
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente os {numSelected} visitante(s) selecionado(s) e todo o seu histórico de visitas.
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
                placeholder="Pesquisar por nome, RG, CPF..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                    <Checkbox 
                        checked={filteredVisitors.length > 0 && numSelected === filteredVisitors.length}
                        indeterminate={numSelected > 0 && numSelected < filteredVisitors.length}
                        onCheckedChange={() => onToggleSelectAll(filteredVisitors)}
                    />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>RG</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhum visitante encontrado.' : 'Nenhum visitante cadastrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id} data-state={selectedVisitors.includes(visitor.id) ? 'selected' : ''}>
                    <TableCell>
                        <Checkbox
                            checked={selectedVisitors.includes(visitor.id)}
                            onCheckedChange={() => onToggleSelection(visitor.id)}
                            aria-label={`Selecionar ${visitor.name}`}
                        />
                    </TableCell>
                    <TableCell className="font-medium">{visitor.name}</TableCell>
                    <TableCell>{visitor.company}</TableCell>
                    <TableCell>{visitor.rg}</TableCell>
                    <TableCell>{visitor.cpf}</TableCell>
                    <TableCell>
                      <Badge variant={visitor.status === 'entered' ? 'success' : 'destructive'} className="capitalize">
                        {visitor.status === 'entered' ? 'Presente' : 'Ausente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       {visitor.status === 'exited' ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => onRevisit(visitor.id)}>
                                    <LogIn className="mr-2 h-4 w-4"/>
                                    Registrar Visita
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Registrar uma nova entrada para este visitante.</p>
                            </TooltipContent>
                        </Tooltip>
                        
                      ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => onExit(visitor.id)}>
                                    <LogOut className="mr-2 h-4 w-4"/>
                                    Registrar Saída
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Registrar a saída para a visita atual.</p>
                            </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
