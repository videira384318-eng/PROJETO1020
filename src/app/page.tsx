"use client";

import { useState, useEffect, useMemo } from 'react';
import type { AttendanceScan } from '@/types';
import { QRScanner } from '@/components/qr-scanner';
import { AttendanceLog } from '@/components/attendance-log';
import { QRGenerator, type QrFormData } from '@/components/qr-generator';
import { EmployeeList, type EmployeeWithStatus } from '@/components/employee-list';
import { QrCodeList } from '@/components/qr-code-list';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from 'date-fns';
import { AppHeader } from '@/components/app-header';
import { addEmployee, deleteEmployees, clearEmployees, getEmployees } from '@/services/employeeService';
import { addScan, deleteScan, getScans } from '@/services/scanService';
import { useAuth } from '@/contexts/auth-context';

export default function Home() {
  const { role } = useAuth();
  const [scans, setScans] = useState<AttendanceScan[]>([]);
  const [employees, setEmployees] = useState<QrFormData[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    
    const unsubscribeEmployees = getEmployees(setEmployees);
    const unsubscribeScans = getScans(setScans);
    
    return () => {
        unsubscribeEmployees();
        unsubscribeScans();
    }
  }, []);

  const handleScan = async (decodedText: string) => {
    if (role === 'rh') {
        toast({
            variant: "destructive",
            title: "Acesso Negado",
            description: "O perfil RH não pode registrar ponto.",
        });
        return;
    }
    try {
      const { nome, setor, placa, ramal } = JSON.parse(decodedText);
      const employeeId = `${nome} (${setor})`;
      
      if (!nome || !setor) {
        throw new Error('Dados do QR code incompletos.');
      }
      
      const lastScanForEmployee = scans.filter(scan => scan.employeeId === employeeId).sort((a,b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime())[0];
      const newScanType = !lastScanForEmployee || lastScanForEmployee.scanType === 'exit' ? 'entry' : 'exit';
      const translatedType = newScanType === 'entry' ? 'entrada' : 'saída';
      
      const newScan: Omit<AttendanceScan, 'scanId'> = {
        employeeId: employeeId,
        scanTime: new Date().toISOString(),
        scanType: newScanType,
        placa: placa || 'N/A',
        ramal: ramal || 'N/A'
      };

      await addScan(newScan);

      toast({
        title: "Escaneamento Concluído!",
        description: `Registrada ${translatedType} para ${employeeId}.`,
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
  
  const handleAddEmployee = async (employeeData: Omit<QrFormData, 'id'>) => {
    try {
        await addEmployee(employeeData);
        toast({
            title: "Funcionário Adicionado!",
            description: `${employeeData.nome} foi adicionado(a) à lista.`
        });
    } catch (error) {
        console.error("Erro ao adicionar funcionário:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Adicionar",
            description: "Não foi possível adicionar o funcionário.",
        });
    }
  }
  
  const handleClearEmployees = async () => {
    try {
        await clearEmployees();
        setSelectedEmployees([]);
        toast({
            title: "Lista Limpa",
            description: "Todos os funcionários foram removidos.",
        });
    } catch(error){
        console.error("Erro ao limpar funcionários:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Limpar",
            description: "Não foi possível limpar a lista de funcionários.",
        });
    }
  }

  const handleDeleteSelectedEmployees = async () => {
    try {
        await deleteEmployees(selectedEmployees);
        toast({
            title: "Funcionários Removidos",
            description: `Os ${selectedEmployees.length} funcionário(s) selecionado(s) foram removidos.`,
        });
        setSelectedEmployees([]);
    } catch (error) {
        console.error("Erro ao excluir funcionários:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: "Não foi possível remover os funcionários selecionados.",
        });
    }
  };

  const handleToggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
      ? prev.filter(id => id !== employeeId)
      : [...prev, employeeId]
    )
  };

  const handleToggleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(e => e.id!));
    }
  };


  const handleDeleteScan = async (scanId: string) => {
    if (role === 'portaria') {
        toast({ variant: "destructive", title: "Acesso Negado" });
        return;
    }
    try {
        await deleteScan(scanId);
        toast({
            title: "Registro Excluído",
            description: "O registro de ponto foi removido do histórico.",
        });
    } catch (error) {
         console.error("Erro ao excluir registro:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: "Não foi possível remover o registro de ponto.",
        });
    }
  }
  
  const handleEmployeeClick = (employee: QrFormData) => {
    if (role === 'rh') {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "O perfil RH não pode registrar ponto.",
      });
      return;
    }
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
  
  const numSelected = selectedEmployees.length;
  const numTotal = employees.length;

  const canAddEmployee = role === 'adm' || role === 'rh';
  const canScan = role === 'adm' || role === 'portaria';
  const canPrint = role === 'adm' || role === 'rh';
  const canDelete = role === 'adm' || role === 'rh';


  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <AppHeader
        title="Controle de Ponto QR"
        description="Gerencie o ponto dos funcionários."
        activePage="employees"
      >
        {canAddEmployee && <QRGenerator onAddEmployee={handleAddEmployee} />}
      </AppHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
            <QRScanner onScan={handleScan} disabled={!canScan}/>
        </div>
        <Tabs defaultValue="employees" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="employees">Funcionários</TabsTrigger>
                <TabsTrigger value="qrcodes" disabled={!canPrint}>QR Codes</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="employees">
                <EmployeeList 
                  employees={employeesWithStatus} 
                  onClear={handleClearEmployees} 
                  onEmployeeClick={handleEmployeeClick}
                  selectedEmployees={selectedEmployees}
                  numSelected={numSelected}
                  numTotal={numTotal}
                  onToggleSelection={handleToggleEmployeeSelection}
                  onToggleSelectAll={handleToggleSelectAll}
                  onDeleteSelected={handleDeleteSelectedEmployees}
                />
            </TabsContent>
            <TabsContent value="qrcodes">
                <QrCodeList employees={employees} onClear={handleClearEmployees} disabled={!canPrint}/>
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
