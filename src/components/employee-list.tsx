
"use client";

import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search } from 'lucide-react';
import type { QrFormData } from './qr-generator';

interface EmployeeListProps {
  employees: QrFormData[];
  onQrClick: (data: QrFormData) => void;
  onClear: () => void;
}

interface EmployeeWithQr extends QrFormData {
  qrUrl: string;
}

export function EmployeeList({ employees, onQrClick, onClear }: EmployeeListProps) {
  const [employeeWithQrs, setEmployeeWithQrs] = useState<EmployeeWithQr[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) {
      return employees;
    }
    return employees.filter(employee =>
      employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.setor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.placa && employee.placa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.ramal && employee.ramal.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [employees, searchTerm]);

  useEffect(() => {
    const generateQRs = async () => {
      const qrs = await Promise.all(
        filteredEmployees.map(async (employee) => {
          const qrUrl = await QRCode.toDataURL(JSON.stringify(employee), {
            width: 100,
            margin: 1,
            color: {
              dark: '#3F51B5',
              light: '#FFFFFF',
            },
          });
          return { ...employee, qrUrl };
        })
      );
      setEmployeeWithQrs(qrs);
    };

    if (filteredEmployees.length > 0) {
      generateQRs();
    } else {
        setEmployeeWithQrs([]);
    }
  }, [filteredEmployees]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    onClear();
    setSearchTerm('');
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Lista de Funcionários</CardTitle>
                <CardDescription>Clique em um QR code para registrar o ponto.</CardDescription>
            </div>
             <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Pesquisar..." 
                        className="pl-9"
                        value={searchTerm}
                        onChange={handleSearchChange}
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
        ) : employeeWithQrs.length === 0 && searchTerm ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente ou limpe o filtro.</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {employeeWithQrs.map((employee, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onQrClick(employee)}
                title={`Registrar ponto para ${employee.nome}`}
              >
                <Image src={employee.qrUrl} alt={`QR Code para ${employee.nome}`} width={60} height={60} className="rounded-md flex-shrink-0" />
                <div className="text-sm overflow-hidden">
                  <p className="font-semibold truncate">{employee.nome}</p>
                  <p className="text-muted-foreground truncate">{employee.setor}</p>
                  {employee.placa && <p className="text-xs text-muted-foreground truncate">Placa: {employee.placa}</p>}
                  {employee.ramal && <p className="text-xs text-muted-foreground truncate">Ramal: {employee.ramal}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
