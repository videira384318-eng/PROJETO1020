
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { AttendanceScan } from '@/types';
import { QRScanner } from '@/components/qr-scanner';
import { AttendanceLog } from '@/components/attendance-log';
import { QRGenerator, type QrFormData } from '@/components/qr-generator';
import { EmployeeList, type EmployeeWithStatus } from '@/components/employee-list';
import { QrCodeList } from '@/components/qr-code-list';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from 'date-fns';
import { AppHeader } from '@/components/app-header';
import { addEmployee, deleteEmployees, clearEmployees, getEmployees } from '@/services/employeeService';
import { addScan, deleteScan, getScans, getLastScanForEmployee } from '@/services/scanService';
import { Skeleton } from '@/components/ui/skeleton';
import { StorageIndicator } from '@/components/storage-indicator';


export default function Home() {
  const [scans, setScans] = useState<AttendanceScan[]>([]);
  const [employees, setEmployees] = useState<QrFormData[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 5, percentage: 0 });
  const { toast } = useToast();
  
  const calculateStorage = useCallback(() => {
    // This function can be deprecated or changed to monitor Firestore usage if needed.
    // For now, we'll keep it as a mock or remove it later.
    // Let's mock it to show 0 usage from local storage.
    setStorageUsage({ used: 0, total: 5, percentage: 0 });
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allEmployees = await getEmployees();
      const allScans = await getScans();
      setEmployees(allEmployees);
      setScans(allScans);
      calculateStorage();
    } catch (error) {
      console.error("Erro ao carregar dados do Firebase:", error);
      toast({
        variant: "destructive",
        title: "Erro ao Carregar Dados",
        description: "Não foi possível buscar os dados do Firebase.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, calculateStorage]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleScan = async (decodedText: string) => {
    try {
      const { nome, setor, placa, ramal, id: employeeDocId } = JSON.parse(decodedText);
      
      if (!employeeDocId) {
        throw new Error('ID do funcionário ausente no QR code.');
      }
      
      const lastScanForEmployee = await getLastScanForEmployee(employeeDocId);
      const newScanType = !lastScanForEmployee || lastScanForEmployee.scanType === 'exit' ? 'entry' : 'exit';
      const translatedType = newScanType === 'entry' ? 'entrada' : 'saída';
      
      const newScan: Omit<AttendanceScan, 'scanId' | 'id'> = {
        employeeId: employeeDocId,
        scanTime: new Date().toISOString(),
        scanType: newScanType,
        placa: placa || 'N/A',
        ramal: ramal || 'N/A'
      };

      await addScan(newScan);
      
      toast({
        title: "Escaneamento Concluído!",
        description: `Registrada ${translatedType} para ${nome} (${setor}).`,
        className: newScanType === 'entry' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      });
      
      // Refresh data after the scan is successful and toast is shown
      await refreshData();

    } catch (error) {
      console.error("Falha ao processar o escaneamento:", error);
      toast({
        variant: "destructive",
        title: "QR Code Inválido",
        description: "Por favor, escaneie um QR code de controle de ponto válido.",
      });
      // Also refresh data on failure to reset loading state
      await refreshData();
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
    } finally {
      await refreshData();
    }
  }
  
  const handleClearEmployees = async () => {
    try {
        await clearEmployees();
        setSelectedEmployees([]);
        toast({
            title: "Lista Limpa",
            description: "Todos os funcionários e seus registros foram removidos.",
        });
    } catch(error){
        console.error("Erro ao limpar funcionários:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Limpar",
            description: "Não foi possível limpar a lista de funcionários.",
        });
    } finally {
        await refreshData();
    }
  }

  const handleDeleteSelectedEmployees = async () => {
    try {
        await deleteEmployees(selectedEmployees);
        setSelectedEmployees([]);
        toast({
            title: "Funcionários Removidos",
            description: `Os ${selectedEmployees.length} funcionário(s) selecionado(s) e seus registros foram removidos.`,
        });
    } catch (error) {
        console.error("Erro ao excluir funcionários:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: "Não foi possível remover os funcionários selecionados.",
        });
    } finally {
        await refreshData();
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
    } finally {
        await refreshData();
    }
  }
  
  const handleEmployeeClick = async (employee: QrFormData) => {
    // We pass the entire employee object to be stringified, including the Firestore ID
    const qrData = JSON.stringify(employee);
    await handleScan(qrData);
  }

  const getEmployeeNameById = useCallback((employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.nome} (${employee.setor})` : 'Funcionário não encontrado';
  }, [employees]);


  const sortedScansForLog = useMemo(() => {
    const filteredScans = selectedDate 
      ? scans.filter(scan => isSameDay(new Date(scan.scanTime), selectedDate))
      : scans;

    // Scans are already sorted by time from the service
    return filteredScans;
  }, [scans, selectedDate]);

  const employeesWithStatus: EmployeeWithStatus[] = useMemo(() => {
    return employees.map(employee => {
      const lastScan = scans
        .filter(scan => scan.employeeId === employee.id)
        .sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime())[0];
      
      return {
        ...employee,
        status: lastScan ? lastScan.scanType : 'exit', // Default to 'exit' if no scans
      };
    });
  }, [employees, scans]);
  
  const numSelected = selectedEmployees.length;
  const numTotal = employees.length;

  if (isLoading) {
    return (
        <main className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Skeleton className="h-10 w-72 mb-2" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                    <Skeleton className="h-10 w-10" />
                     <Skeleton className="h-10 w-40" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Skeleton className="h-[400px] lg:col-span-1" />
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        </main>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <AppHeader
        title="Controle de Ponto QR"
        description="Gerencie o ponto dos funcionários."
        activePage="employees"
      >
        <QRGenerator onAddEmployee={handleAddEmployee} />
      </AppHeader>
      
      <div className="mb-8">
          <StorageIndicator
            used={storageUsage.used}
            total={storageUsage.total}
            percentage={storageUsage.percentage}
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="flex flex-col gap-8 lg:col-span-1">
            <QRScanner onScan={handleScan} />
        </div>
        <div className="lg:col-span-2">
            <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="employees">Funcionários</TabsTrigger>
                    <TabsTrigger value="qrcodes">QR Codes</TabsTrigger>
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
                    <QrCodeList employees={employees} onClear={handleClearEmployees} />
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
                                getEmployeeNameById={getEmployeeNameById}
                                onDelete={handleDeleteScan}
                                onToggleCalendar={() => setShowCalendar(prev => !prev)}
                                isCalendarOpen={showCalendar}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </main>
  );
}

    