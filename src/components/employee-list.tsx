
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search, LogIn, LogOut, Edit, QrCode } from 'lucide-react';
import type { QrFormData } from './qr-generator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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


export interface EmployeeWithStatus extends QrFormData {
  status: 'entry' | 'exit';
}

interface EmployeeListProps {
  employees: EmployeeWithStatus[];
  onClear: () => void;
  onManualEntry: (employee: QrFormData) => void;
  onEdit: (employee: QrFormData) => void;
  onToggleActive: (employeeId: string, currentStatus: boolean) => void;
  selectedEmployees: string[];
  numSelected: number;
  numTotal: number;
  onToggleSelection: (employeeId: string) => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
}

export function EmployeeList({ 
  employees, 
  onClear, 
  onManualEntry,
  onEdit,
  onToggleActive,
  selectedEmployees,
  numSelected,
  numTotal,
  onToggleSelection,
  onToggleSelectAll,
  onDeleteSelected
 }: EmployeeListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!appliedSearchTerm) {
      return employees;
    }
    return employees.filter(employee =>
      employee.nome.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      employee.setor.toLowerCase().includes(appliedSearchTerm.toLowerCase()) ||
      (employee.placa && employee.placa.toLowerCase().includes(appliedSearchTerm.toLowerCase())) ||
      (employee.ramal && employee.ramal.toLowerCase().includes(appliedSearchTerm.toLowerCase()))
    );
  }, [employees, appliedSearchTerm]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    if (newSearchTerm === '') {
        setAppliedSearchTerm('');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        setAppliedSearchTerm(searchTerm);
    }
  }
  
  const stopPropagation = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleClear = () => {
    onClear();
    setSearchTerm('');
    setAppliedSearchTerm('');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Lista de Funcionários</CardTitle>
                <CardDescription>Visualize, gerencie e registre o ponto dos funcionários.</CardDescription>
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
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente os {numSelected} funcionário(s) selecionado(s).
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
                        placeholder="Pesquisar e pressionar Enter" 
                        className="pl-9"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                {employees.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={employees.length === 0}>
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Limpar Lista de Funcionários</span>
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Limpar toda a lista?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Essa ação não pode ser desfeita. Todos os funcionários serão removidos.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleClear}>Limpar Tudo</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <Users className="h-10 w-10 mb-4" />
            <p className="font-semibold">Nenhum funcionário adicionado</p>
            <p className="text-sm">Adicione funcionários para vê-los aqui.</p>
          </div>
        ) : filteredEmployees.length === 0 && appliedSearchTerm ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente ou limpe o filtro.</p>
            </div>
        ) : (
          <div className="border rounded-md">
            <TooltipProvider>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[40px]">
                            <Checkbox 
                            checked={numTotal > 0 && numSelected === numTotal}
                            indeterminate={numSelected > 0 && numSelected < numTotal}
                            onCheckedChange={onToggleSelectAll}
                            />
                        </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ativo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEmployees.map((employee) => (
                    <TableRow 
                        key={employee.id} 
                        data-state={selectedEmployees.includes(employee.id!) ? 'selected' : ''}
                        className="group"
                    >
                        <TableCell onClick={stopPropagation}>
                            <Checkbox
                                checked={selectedEmployees.includes(employee.id!)}
                                onCheckedChange={() => onToggleSelection(employee.id!)}
                                aria-label={`Selecionar ${employee.nome}`}
                            />
                        </TableCell>
                        <TableCell className="font-medium">{employee.nome}</TableCell>
                        <TableCell>{employee.setor}</TableCell>
                        <TableCell>
                            <Badge variant={employee.status === 'entry' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit text-xs px-2 py-0.5">
                                {employee.status === 'entry' ? <LogIn size={12}/> : <LogOut size={12}/>}
                                {employee.status === 'entry' ? 'Dentro' : 'Fora'}
                            </Badge>
                        </TableCell>
                        <TableCell onClick={stopPropagation}>
                            <Tooltip>
                                <TooltipTrigger>
                                     <Switch 
                                        checked={employee.active}
                                        onCheckedChange={() => onToggleActive(employee.id!, employee.active!)}
                                        aria-label={employee.active ? 'Desativar QR Code' : 'Ativar QR Code'}
                                     />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{employee.active ? 'QR Code Ativo' : 'QR Code Inativo'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TableCell>
                         <TableCell className="text-right" onClick={stopPropagation}>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                               <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => onManualEntry(employee)}>
                                            <QrCode className="h-4 w-4" />
                                            <span className="sr-only">Registrar Ponto Manual</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Registrar Ponto Manual</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}>
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Editar</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Editar Funcionário</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
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
