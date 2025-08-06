
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search, LogIn, LogOut } from 'lucide-react';
import type { QrFormData } from './qr-generator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export interface EmployeeWithStatus extends QrFormData {
  status: 'entry' | 'exit';
}

interface EmployeeListProps {
  employees: EmployeeWithStatus[];
  onClear: () => void;
}

export function EmployeeList({ employees, onClear }: EmployeeListProps) {
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
                <CardDescription>Visualize e gerencie os funcionários cadastrados.</CardDescription>
            </div>
             <div className="flex items-center gap-2 w-full md:w-auto">
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
                <Button variant="ghost" size="icon" onClick={handleClear} disabled={employees.length === 0}>
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Limpar Lista de Funcionários</span>
                </Button>
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
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Ramal</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredEmployees.map((employee, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{employee.nome}</TableCell>
                        <TableCell>{employee.setor}</TableCell>
                        <TableCell>{employee.placa || 'N/A'}</TableCell>
                        <TableCell>{employee.ramal || 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={employee.status === 'entry' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1.5 w-fit">
                                {employee.status === 'entry' ? <LogIn size={14}/> : <LogOut size={14}/>}
                                {employee.status === 'entry' ? 'Dentro' : 'Fora'}
                            </Badge>
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
