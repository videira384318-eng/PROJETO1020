"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search } from 'lucide-react';
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

interface VisitorListProps {
  visitors: VisitorFormData[];
  onDelete: (visitorId: string) => void;
}

export function VisitorList({ visitors, onDelete }: VisitorListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisitors = useMemo(() => {
    if (!searchTerm) {
      return visitors;
    }
    return visitors.filter(visitor =>
      visitor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.rg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visitor.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (visitor.placa && visitor.placa.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [visitors, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Visitantes Registrados</CardTitle>
                <CardDescription>Visualize e gerencie os visitantes cadastrados.</CardDescription>
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
          <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>RG</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Portaria</TableHead>
                    <TableHead>Data de Entrada</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredVisitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                        <TableCell className="font-medium">{visitor.nome}</TableCell>
                        <TableCell>{visitor.cpf}</TableCell>
                        <TableCell>{visitor.rg}</TableCell>
                        <TableCell>{visitor.empresa}</TableCell>
                        <TableCell>{visitor.placa || "N/A"}</TableCell>
                        <TableCell>{visitor.responsavel}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase">{visitor.portaria}</Badge>
                        </TableCell>
                        <TableCell>{visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : 'N/A'}</TableCell>
                        <TableCell className="text-right">
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
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
           </div>
        )}
      </CardContent>
    </Card>
  );
}
