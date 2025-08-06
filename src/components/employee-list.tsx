
"use client";

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Trash2, Users } from 'lucide-react';
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

  useEffect(() => {
    const generateQRs = async () => {
      const qrs = await Promise.all(
        employees.map(async (employee) => {
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

    if (employees.length > 0) {
      generateQRs();
    } else {
        setEmployeeWithQrs([]);
    }
  }, [employees]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline">Lista de Funcionários</CardTitle>
            <CardDescription>Clique em um QR code para registrar o ponto.</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClear} disabled={employees.length === 0}>
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Limpar Lista de Funcionários</span>
        </Button>
      </CardHeader>
      <CardContent>
        {employeeWithQrs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <Users className="h-10 w-10 mb-4" />
            <p className="font-semibold">Nenhum funcionário adicionado</p>
            <p className="text-sm">Adicione funcionários para vê-los aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {employeeWithQrs.map((employee, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onQrClick(employee)}
                title={`Registrar ponto para ${employee.nome}`}
              >
                <Image src={employee.qrUrl} alt={`QR Code para ${employee.nome}`} width={60} height={60} className="rounded-md" />
                <div className="text-sm overflow-hidden">
                  <p className="font-semibold truncate">{employee.nome}</p>
                  <p className="text-muted-foreground truncate">{employee.setor}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
