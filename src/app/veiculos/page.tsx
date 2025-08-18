
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, Truck, Calendar as CalendarIcon } from 'lucide-react';
import { VehicleList, type VehicleWithStatus } from '@/components/vehicle-list';
import { VehicleHistory } from '@/components/vehicle-history';
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from '@/components/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleMovementDialog, type MovementFormData } from '@/components/vehicle-movement-dialog';
import { EditVehicleLogDialog, type EditLogFormData } from '@/components/edit-vehicle-log-dialog';
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from 'date-fns';
import { 
    addVehicle, 
    deleteVehicle, 
    getVehicles, 
    addVehicleLog,
    updateVehicleLog,
    deleteVehicleLog,
    getVehicleLog,
    updateVehicle,
    getLastVehicleLog
} from '@/services/vehicleService';
import { Skeleton } from '@/components/ui/skeleton';


const vehicleFormSchema = z.object({
  id: z.string().optional(),
  placa: z.string().min(1, "A placa é obrigatória.").toUpperCase(),
  condutor: z.string().min(1, "O nome do condutor é obrigatório."),
  portaria: z.enum(['p1', 'p2'], {
    required_error: "Selecione a portaria.",
  }),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export interface VehicleLogEntry extends VehicleFormData {
    logId: string;
    timestamp: string;
    type: 'entry' | 'exit';
}

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleFormData[]>([]);
  const [vehicleLog, setVehicleLog] = useState<VehicleLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [movementVehicle, setMovementVehicle] = useState<VehicleWithStatus | null>(null);
  const [editingLogEntry, setEditingLogEntry] = useState<VehicleLogEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();


  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      placa: '',
      condutor: '',
      portaria: 'p1',
    },
  });

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        const [vehiclesData, vehicleLogData] = await Promise.all([
            getVehicles(),
            getVehicleLog()
        ]);
        setVehicles(vehiclesData);
        setVehicleLog(vehicleLogData);
    } catch (error) {
        console.error("Failed to fetch vehicle data:", error);
        toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível buscar os dados de veículos.",
        });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVehicle = async (data: VehicleFormData) => {
    try {
        await addVehicle(data);
        toast({
          title: "Veículo Cadastrado!",
          description: `O veículo com placa ${data.placa} foi adicionado.`,
        });
        form.reset();
        await fetchData();
    } catch(e) {
        console.error("Erro ao adicionar veículo:", e);
        toast({
            variant: "destructive",
            title: "Erro ao Salvar",
            description: "Não foi possível cadastrar o veículo."
        })
    }
  };
  
  const handleDeleteVehicle = async (vehicleId: string) => {
    try {
        await deleteVehicle(vehicleId);
        toast({
          title: "Veículo Removido",
          description: "O veículo foi removido da lista e seu histórico foi mantido.",
        });
        await fetchData();
    } catch (e) {
        console.error("Erro ao remover veículo:", e);
        toast({
            variant: "destructive",
            title: "Erro ao Remover",
            description: "Não foi possível remover o veículo."
        })
    }
  };

  const handleVehicleClick = (vehicle: VehicleWithStatus) => {
    setMovementVehicle(vehicle);
  }
  
  const handleMovementSubmit = async (data: MovementFormData) => {
    if (!movementVehicle) return;

    const lastLog = await getLastVehicleLog(movementVehicle.id!);
    const newType = !lastLog || lastLog.type === 'exit' ? 'entry' : 'exit';
    const translatedType = newType === 'entry' ? 'entrada' : 'saída';

    const newLogEntry: Omit<VehicleLogEntry, 'logId'> = {
        ...movementVehicle,
        ...data,
        id: movementVehicle.id!,
        timestamp: new Date().toISOString(),
        type: newType,
    };
    
    try {
        await addVehicleLog(newLogEntry);
        await updateVehicle(movementVehicle.id!, data);
        
        toast({
            title: "Movimentação Registrada!",
            description: `Registrada ${translatedType} para o veículo ${movementVehicle.placa}.`,
            className: newType === 'entry' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
        });
        
        setMovementVehicle(null);
        await fetchData();
    } catch (e) {
         console.error("Erro ao registrar movimentação:", e);
        toast({
            variant: "destructive",
            title: "Erro ao Registrar",
            description: "Não foi possível registrar a movimentação."
        })
    }
  }
  
  const handleEditLogEntry = (logEntry: VehicleLogEntry) => {
    setEditingLogEntry(logEntry);
  };
  
  const handleDeleteVehicleLog = async (logId: string) => {
    try {
        await deleteVehicleLog(logId);
        toast({
          title: "Registro de Histórico Removido",
          description: "A movimentação foi removida do histórico.",
        });
        await fetchData();
    } catch(e) {
        console.error("Erro ao remover registro do histórico:", e);
        toast({
            variant: "destructive",
            title: "Erro ao Remover",
            description: "Não foi possível remover o registro do histórico."
        })
    }
  }

  const handleEditLogSubmit = async (data: EditLogFormData) => {
    if (!editingLogEntry) return;

    const newDate = new Date(data.date);
    const [hours, minutes] = data.time.split(':').map(Number);
    newDate.setHours(hours, minutes, 0, 0);

    const updatedLogEntry = {
      condutor: data.condutor,
      timestamp: newDate.toISOString(),
    };
    
    try {
        await updateVehicleLog(editingLogEntry.logId, updatedLogEntry);
        toast({
            title: "Registro Atualizado!",
            description: `O registro do veículo ${editingLogEntry.placa} foi atualizado.`,
        });
        setEditingLogEntry(null);
        await fetchData();
    } catch(e) {
        console.error("Erro ao atualizar registro:", e);
        toast({
            variant: "destructive",
            title: "Erro ao Atualizar",
            description: "Não foi possível atualizar o registro."
        })
    }
  }

  const vehiclesWithStatus: VehicleWithStatus[] = useMemo(() => {
    return vehicles.map(vehicle => {
      const lastLog = vehicleLog
        .filter(log => log.id === vehicle.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      return {
        ...vehicle,
        status: lastLog ? lastLog.type : 'exit', 
      };
    }).sort((a, b) => {
       if (a.placa < b.placa) return -1;
       if (a.placa > b.placa) return 1;
       return 0;
    });
  }, [vehicles, vehicleLog]);

  const sortedVehiclesForLog = useMemo(() => {
    const filteredLog = selectedDate
        ? vehicleLog.filter(log => isSameDay(new Date(log.timestamp), selectedDate))
        : vehicleLog;
    
    return filteredLog.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [vehicleLog, selectedDate]);


  const canManageVehicles = true;

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
        title="Controle de Veículos"
        description="Registre e gerencie as entradas e saídas de veículos."
        activePage="vehicles"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Truck className="h-6 w-6"/> Novo Veículo</CardTitle>
                <CardDescription>Preencha os dados abaixo para registrar.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddVehicle)} className="space-y-4">
                    <fieldset>
                        <FormField
                        control={form.control}
                        name="placa"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Placa</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: BRA2E19" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="condutor"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Condutor</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: João da Silva" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="portaria"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>Portaria Comum</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex items-center space-x-4"
                                >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="p1" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    P1
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="p2" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    P2
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </fieldset>
                    <Button type="submit" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Salvar Veículo
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>

        <div className="lg:col-span-2">
            <Tabs defaultValue="vehicles">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="vehicles">Veículos Cadastrados</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                    <TabsContent value="vehicles">
                        <VehicleList 
                            vehicles={vehiclesWithStatus}
                            onDelete={handleDeleteVehicle}
                            onVehicleClick={handleVehicleClick}
                        />
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
                            <VehicleHistory
                                log={sortedVehiclesForLog}
                                onEdit={handleEditLogEntry}
                                onDelete={handleDeleteVehicleLog}
                                canManage={canManageVehicles}
                                onToggleCalendar={() => setShowCalendar(prev => !prev)}
                                isCalendarOpen={showCalendar}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
      </div>
      
        <>
            <VehicleMovementDialog
                isOpen={!!movementVehicle}
                onClose={() => setMovementVehicle(null)}
                vehicle={movementVehicle}
                onSubmit={handleMovementSubmit}
            />
            
            <EditVehicleLogDialog
                isOpen={!!editingLogEntry}
                onClose={() => setEditingLogEntry(null)}
                logEntry={editingLogEntry}
                onSubmit={handleEditLogSubmit}
            />
        </>

    </main>
  );
}
