"use client";

import { useState, useEffect, useMemo } from 'react';
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';
import { QRScanner } from '@/components/qr-scanner';
import { AttendanceLog } from '@/components/attendance-log';
import { QRGenerator, type QrFormData } from '@/components/qr-generator';
import { EmployeeList, type EmployeeWithStatus } from '@/components/employee-list';
import { QrCodeList } from '@/components/qr-code-list';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from 'date-fns';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [scans, setScans] = useState<AttendanceScan[]>([]);
  const [employees, setEmployees] = useState<QrFormData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedScans = localStorage.getItem('qr-attendance-scans');
      if (storedScans) {
        setScans(JSON.parse(storedScans));
      }
      const storedEmployees = localStorage.getItem('qr-attendance-employees');
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      }
    } catch (error) {
      console.error("Falha ao analisar os registros do localStorage", error);
      localStorage.removeItem('qr-attendance-scans');
      localStorage.removeItem('qr-attendance-employees');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-scans', JSON.stringify(scans));
    }
  }, [scans, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-employees', JSON.stringify(employees));
    }
  }, [employees, isClient]);

  const handleScan = (decodedText: string) => {
    try {
      const { nome, setor, placa, ramal } = JSON.parse(decodedText);
      const employeeId = `${nome} (${setor})`;
      
      if (!nome || !setor) {
        throw new Error('Dados do QR code incompletos.');
      }
      
      const lastScanForEmployee = scans.filter(scan => scan.employeeId === employeeId).sort((a,b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime())[0];
      const newScanType = !lastScanForEmployee || lastScanForEmployee.scanType === 'exit' ? 'entry' : 'exit';
      const translatedType = newScanType === 'entry' ? 'entrada' : 'saída';
      
      const newScan: AttendanceScan = {
        scanId: `scan_${new Date().getTime()}_${Math.random().toString(36).substring(7)}`,
        employeeId: employeeId,
        scanTime: new Date().toISOString(),
        scanType: newScanType,
        placa: placa || 'N/A',
        ramal: ramal || 'N/A'
      };

      setScans(prevScans => [newScan, ...prevScans]);
      setIsScanning(false);
      toast({
        title: "Escaneamento Concluído!",
        description: `Registrada ${translatedType} para ${newScan.employeeId}.`,
        className: newScanType === 'entry' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      });

    } catch (error) {
      console.error("Falha ao processar o escaneamento:", error);
      toast({
        variant: "destructive",
        title: "QR Code Inválido",
        description: "Por favor, escaneie um QR code de controle de ponto válido.",
      });
    }
  };
  
  const handleAddEmployee = (employeeData: QrFormData) => {
    setEmployees(prev => [...prev, employeeData]);
  }
  
  const handleClearEmployees = () => {
    setEmployees([]);
    localStorage.removeItem('qr-attendance-employees');
  }

  const handleDeleteScan = (scanId: string) => {
    setScans(prevScans => prevScans.filter(scan => scan.scanId !== scanId));
    toast({
        title: "Registro Excluído",
        description: "O registro de ponto foi removido do histórico.",
    });
  }
  
  const handleEmployeeClick = (employee: QrFormData) => {
    const qrData = JSON.stringify({ nome: employee.nome, setor: employee.setor, placa: employee.placa, ramal: employee.ramal });
    handleScan(qrData);
  }

  const sortedScansForLog = useMemo(() => {
    const filteredScans = selectedDate 
      ? scans.filter(scan => isSameDay(new Date(scan.scanTime), selectedDate))
      : scans;

    return [...filteredScans].sort((a, b) => {
      if (a.employeeId < b.employeeId) return -1;
      if (a.employeeId > b.employeeId) return 1;
      return new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime();
    });
  }, [scans, selectedDate]);

  const employeesWithStatus: EmployeeWithStatus[] = useMemo(() => {
    return employees.map(employee => {
      const employeeId = `${employee.nome} (${employee.setor})`;
      const lastScan = scans
        .filter(scan => scan.employeeId === employeeId)
        .sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime())[0];
      
      return {
        ...employee,
        status: lastScan ? lastScan.scanType : 'exit', // Default to 'exit' if no scans
      };
    });
  }, [employees, scans]);


  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">Controle de Ponto QR</h1>
          <p className="text-muted-foreground">Gere QR codes para os funcionários ou escaneie para registrar o ponto.</p>
        </div>
        <div className="flex gap-2">
            <QRGenerator onAddEmployee={handleAddEmployee}/>
            <ThemeToggle />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <QRScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />
        <Tabs defaultValue="employees" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="employees">Funcionários</TabsTrigger>
                <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="employees">
                <EmployeeList employees={employeesWithStatus} onClear={handleClearEmployees} onEmployeeClick={handleEmployeeClick} />
            </TabsContent>
            <TabsContent value="qrcodes">
                <QrCodeList employees={employees} onClear={handleClearEmployees}/>
            </TabsContent>
            <TabsContent value="history">
                <div className="flex flex-col lg:flex-row gap-8">
                    {showCalendar && (
                        <div className="flex-shrink-0">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => {
                                    setSelectedDate(date);
                                    setShowCalendar(false);
                                }}
                                className="rounded-md border"
                                initialFocus
                            />
                        </div>
                    )}
                    <div className="flex-grow w-full">
                        <AttendanceLog 
                            scans={sortedScansForLog} 
                            employees={employees} 
                            onDelete={handleDeleteScan}
                            onToggleCalendar={() => setShowCalendar(prev => !prev)}
                            isCalendarOpen={showCalendar}
                        />
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
