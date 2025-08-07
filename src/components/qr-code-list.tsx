
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Users, Search, Printer } from 'lucide-react';
import type { QrFormData } from './qr-generator';

interface QrCodeListProps {
  employees: QrFormData[];
  onClear: () => void;
  disabled?: boolean;
}

interface EmployeeWithQr extends QrFormData {
  qrUrl: string;
}

export function QrCodeList({ employees, onClear, disabled = false }: QrCodeListProps) {
  const [employeeWithQrs, setEmployeeWithQrs] = useState<EmployeeWithQr[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const generateQRs = async () => {
      const qrs = await Promise.all(
        filteredEmployees.map(async (employee) => {
          // IMPORTANT: The QR code now contains the employee's Firestore document ID
          const qrData = JSON.stringify({
            id: employee.id, // This is the crucial part for Firestore lookup
            nome: employee.nome,
            setor: employee.setor,
            placa: employee.placa,
            ramal: employee.ramal
          });
          const qrUrl = await QRCode.toDataURL(qrData, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
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
  
  const handlePrint = (employee: EmployeeWithQr) => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Imprimir QR Code</title>');
      printWindow.document.write('<style>body { font-family: sans-serif; text-align: center; margin-top: 50px; } img { max-width: 300px; } h1 { font-size: 24px; } p { font-size: 18px; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(`<h1>${employee.nome}</h1>`);
      printWindow.document.write(`<p>${employee.setor}</p>`);
      printWindow.document.write(`<img src="${employee.qrUrl}" alt="QR Code de ${employee.nome}" />`);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">QR Codes dos Funcionários</CardTitle>
                <CardDescription>Imprima os QR codes individuais.</CardDescription>
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
                        disabled={disabled}
                    />
                </div>
                <Button variant="ghost" size="icon" onClick={handleClear} disabled={employees.length === 0 || disabled}>
                    <Trash2 className="h-5 w-5" />
                    <span className="sr-only">Limpar Lista de Funcionários</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {disabled ? (
             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Users className="h-10 w-10 mb-4" />
                <p className="font-semibold">Acesso Negado</p>
                <p className="text-sm">Seu perfil não pode visualizar ou imprimir QR Codes.</p>
            </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <Users className="h-10 w-10 mb-4" />
            <p className="font-semibold">Nenhum funcionário adicionado</p>
            <p className="text-sm">Adicione funcionários para gerar os QR Codes.</p>
          </div>
        ) : employeeWithQrs.length === 0 && appliedSearchTerm ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente ou limpe o filtro.</p>
            </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {employeeWithQrs.map((employee, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg flex flex-col items-center justify-center text-center gap-3"
              >
                <Image src={employee.qrUrl} alt={`QR Code para ${employee.nome}`} width={150} height={150} className="rounded-md" />
                <div className="text-sm overflow-hidden w-full">
                  <p className="font-semibold truncate">{employee.nome}</p>
                  <p className="text-muted-foreground truncate">{employee.setor}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handlePrint(employee)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
