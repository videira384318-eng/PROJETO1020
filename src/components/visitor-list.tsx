
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, User, Search, LogOut } from 'lucide-react';
import type { Visitor } from '@/types';
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

interface VisitorListProps {
  visitors: Visitor[];
  onExit: (visitorId: string) => void;
  selectedVisitors: string[];
  onToggleSelection: (visitorId: string) => void;
  onToggleSelectAll: (filteredVisitors: Visitor[]) => void;
  onDeleteSelected: () => void;
}

export function VisitorList({ 
    visitors, 
    onExit,
    selectedVisitors,
    onToggleSelection,
    onToggleSelectAll,
    onDeleteSelected
}: VisitorListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'inside' | 'all'>('inside');

  const filteredVisitors = useMemo(() => {
    return visitors
      .filter(visitor => {
        const matchesFilter = filter === 'all' || visitor.status === 'entered';
        const matchesSearch = !searchTerm ||
          visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (visitor.rg && visitor.rg.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (visitor.cpf && visitor.cpf.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (visitor.plate && visitor.plate.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (visitor.responsible && visitor.responsible.toLowerCase().includes(searchTerm.toLowerCase())) ||
          visitor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          visitor.reason.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime());
  }, [visitors, searchTerm, filter]);

   const numSelected = selectedVisitors.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="font-headline">Visitantes Presentes</CardTitle>
            <CardDescription>Visualize e gerencie os visitantes na empresa.</CardDescription>
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
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente os {numSelected} registro(s) de visitante(s) selecionado(s).
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
                placeholder="Pesquisar visitante..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Button 
                variant={filter === 'inside' ? 'secondary' : 'outline'}
                onClick={() => setFilter('inside')}
            >
                Presentes
            </Button>
            <Button 
                variant={filter === 'all' ? 'secondary' : 'outline'}
                onClick={() => setFilter('all')}
            >
                Histórico
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
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
                <TableHead>Placa</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhum visitante encontrado.' : 'Nenhum visitante registrado.'}
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
                    <TableCell>{visitor.name}</TableCell>
                    <TableCell>{visitor.company}</TableCell>
                    <TableCell>{visitor.rg}</TableCell>
                    <TableCell>{visitor.cpf}</TableCell>
                    <TableCell>{visitor.plate || 'N/A'}</TableCell>
                    <TableCell>{visitor.responsible}</TableCell>
                    <TableCell>{visitor.reason}</TableCell>
                    <TableCell>{new Date(visitor.entryTimestamp).toLocaleString()}</TableCell>
                    <TableCell>
                        {visitor.exitTimestamp ? new Date(visitor.exitTimestamp).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={visitor.status === 'entered' ? 'success' : 'destructive'} className="capitalize">
                        {visitor.status === 'entered' ? 'Presente' : 'Saiu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {visitor.status === 'entered' && (
                        <Button variant="destructive" size="sm" onClick={() => onExit(visitor.id)}>
                           <LogOut className="mr-2 h-4 w-4"/>
                          Registrar Saída
                        </Button>
                      )}
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
