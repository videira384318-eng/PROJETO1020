
"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { AttendanceScan } from '@/types';
import { QRScanner, type QRScannerRef } from '@/components/qr-scanner';
import { AttendanceLog } from '@/components/attendance-log';
import { QRGenerator, type QrFormData } from '@/components/qr-generator';
import { EditEmployeeDialog } from '@/components/edit-employee-dialog';
import { EmployeeList, type EmployeeWithStatus } from '@/components/employee-list';
import { QrCodeList } from '@/components/qr-code-list';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from 'date-fns';
import { AppHeader } from '@/components/app-header';
import { addEmployee, deleteEmployees, clearEmployees, getEmployees, updateEmployee } from '@/services/employeeService';
import { addScan, deleteScan, getScans, getLastScanForEmployee } from '@/services/scanService';
import { Skeleton } from '@/components/ui/skeleton';
import { StorageIndicator } from '@/components/storage-indicator';


export default function Home() {
  const [scans, setScans] = useState<AttendanceScan[]>([]);
  const [employees, setEmployees] = useState<QrFormData[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<QrFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 5, percentage: 0 });
  const [lastScan, setLastScan] = useState<{data: string, time: number} | null>(null);
  const { toast } = useToast();
  const qrScannerRef = useRef<QRScannerRef>(null);
  
  const calculateStorage = useCallback(() => {
    try {
      const scansSize = new Blob([JSON.stringify(localStorage.getItem('scans') || '')]).size;
      const employeesSize = new Blob([JSON.stringify(localStorage.getItem('employees') || '')]).size;
      const totalUsedBytes = scansSize + employeesSize;
      const totalUsedMb = (totalUsedBytes / (1024 * 1024)).toFixed(2);
      const totalMb = 5; 
      const percentage = (parseFloat(totalUsedMb) / totalMb) * 100;

      setStorageUsage({ used: parseFloat(totalUsedMb), total: totalMb, percentage });
    } catch (error) {
      console.error("Error calculating storage usage:", error);
      setStorageUsage({ used: 0, total: 5, percentage: 0 });
    }
  }, []);

  const refreshData = useCallback(() => {
    setIsLoading(true);
    const allEmployees = getEmployees();
    const allScans = getScans();
    setEmployees(allEmployees);
    setScans(allScans);
    calculateStorage();
    setIsLoading(false);
  }, [calculateStorage]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleScan = (decodedText: string) => {
    // 20 second cooldown for the same QR code
    if (lastScan && lastScan.data === decodedText && (Date.now() - lastScan.time) < 20000) {
        toast({
            variant: "destructive",
            title: "Aguarde um momento",
            description: "Você precisa esperar 20 segundos para escanear o mesmo QR code novamente.",
        });
        return;
    }

    try {
      const scannedData: QrFormData = JSON.parse(decodedText);
      const { nome, setor, placa, ramal, id: employeeId, active } = scannedData;
      
      const employeeExists = employees.some(e => e.id === employeeId);
      if (!employeeExists) {
        throw new Error('Funcionário não encontrado na lista.');
      }
      
      // Check if QR code is active
      if (active === false) {
          toast({
            variant: "destructive",
            title: "QR Code Inativo",
            description: "Por favor, procure o RH.",
          });
          qrScannerRef.current?.stopScanner();
          return;
      }
      
      const lastScanForEmployee = getLastScanForEmployee(employeeId!);
      const newScanType = !lastScanForEmployee || lastScanForEmployee.scanType === 'exit' ? 'entry' : 'exit';
      const translatedType = newScanType === 'entry' ? 'entrada' : 'saída';
      
      const newScan: Omit<AttendanceScan, 'scanId' | 'id'> = {
        employeeId: employeeId!,
        scanTime: new Date().toISOString(),
        scanType: newScanType,
        placa: placa || 'N/A',
        ramal: ramal || 'N/A'
      };

      addScan(newScan);
      setLastScan({data: decodedText, time: Date.now()});
      
      toast({
        title: "Escaneamento Concluído!",
        description: `Registrada ${translatedType} para ${nome} (${setor}).`,
        className: newScanType === 'entry' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
      });
      
      refreshData();
      qrScannerRef.current?.stopScanner();

    } catch (error) {
      console.error("Falha ao processar o escaneamento:", error);
      toast({
        variant: "destructive",
        title: "QR Code Inválido",
        description: "Por favor, escaneie um QR code de controle de ponto válido.",
      });
    }
  };
  
  const handleAddEmployee = (employeeData: Omit<QrFormData, 'id' | 'active'>) => {
    const employeeExists = employees.some(
      (e) => e.nome.trim().toLowerCase() === employeeData.nome.trim().toLowerCase()
    );

    if (employeeExists) {
      toast({
        variant: "destructive",
        title: "Funcionário já cadastrado",
        description: `Um funcionário com o nome "${employeeData.nome}" já existe.`,
      });
      return;
    }

    addEmployee(employeeData);
    toast({
        title: "Funcionário Adicionado!",
        description: `${employeeData.nome} foi adicionado(a) à lista.`
    });
    refreshData();
  }

  const handleUpdateEmployee = (employeeData: QrFormData) => {
    updateEmployee(employeeData.id!, employeeData);
    toast({
        title: "Funcionário Atualizado!",
        description: `Os dados de ${employeeData.nome} foram atualizados.`
    });
    setEditingEmployee(null);
    refreshData();
  }
  
  const handleClearEmployees = () => {
    clearEmployees();
    setSelectedEmployees([]);
    toast({
        title: "Lista Limpa",
        description: "Todos os funcionários e seus registros foram removidos.",
    });
    refreshData();
  }

  const handleDeleteSelectedEmployees = () => {
    deleteEmployees(selectedEmployees);
    const count = selectedEmployees.length;
    setSelectedEmployees([]);
    toast({
        title: "Funcionários Removidos",
        description: `Os ${count} funcionário(s) selecionado(s) e seus registros foram removidos.`,
    });
    refreshData();
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


  const handleDeleteScan = (scanId: string) => {
    deleteScan(scanId);
    toast({
        title: "Registro Excluído",
        description: "O registro de ponto foi removido do histórico.",
    });
    refreshData();
  }
  
  const handleManualEntry = (employee: QrFormData) => {
    const qrData = JSON.stringify(employee);
    handleScan(qrData);
  }

  const handleEditClick = (employee: QrFormData) => {
    setEditingEmployee(employee);
  };

  const getEmployeeNameById = useCallback((employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.nome} (${employee.setor})` : 'Funcionário não encontrado';
  }, [employees]);


  const sortedScansForLog = useMemo(() => {
    const filteredScans = selectedDate 
      ? scans.filter(scan => isSameDay(new Date(scan.scanTime), selectedDate))
      : scans;

    return filteredScans.sort((a,b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
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
    <>
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
            <QRScanner ref={qrScannerRef} onScan={handleScan} />
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
                    onManualEntry={handleManualEntry}
                    onEdit={handleEditClick}
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
    <EditEmployeeDialog 
      isOpen={!!editingEmployee}
      onClose={() => setEditingEmployee(null)}
      employee={editingEmployee}
      onSubmit={handleUpdateEmployee}
    />
    </>
  );
}

