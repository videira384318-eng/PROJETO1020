"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, Truck, History } from 'lucide-react';
import { VehicleList, type VehicleWithStatus } from '@/components/vehicle-list';
import { VehicleHistory } from '@/components/vehicle-history';
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from '@/components/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const vehicleFormSchema = z.object({
  id: z.string().optional(),
  placa: z.string().min(1, "A placa é obrigatória."),
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
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      placa: '',
      condutor: '',
      portaria: 'p1',
    },
  });

  useEffect(() => {
    setIsClient(true);
    const storedVehicles = localStorage.getItem('qr-attendance-vehicles');
    if (storedVehicles) {
        try {
            setVehicles(JSON.parse(storedVehicles));
        } catch (error) {
            console.error("Falha ao analisar os veículos do localStorage", error);
        }
    }
     const storedLog = localStorage.getItem('qr-attendance-vehicle-log');
    if (storedLog) {
        try {
            setVehicleLog(JSON.parse(storedLog));
        } catch (error) {
            console.error("Falha ao analisar o histórico de veículos do localStorage", error);
        }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-vehicle-log', JSON.stringify(vehicleLog));
    }
  }, [vehicleLog, isClient]);

  const handleAddVehicle = (data: VehicleFormData) => {
    const newVehicle: VehicleFormData = {
      ...data,
      id: `vehicle_${new Date().getTime()}`,
    };
    setVehicles(prev => [newVehicle, ...prev]);
    toast({
      title: "Veículo Cadastrado!",
      description: `O veículo com placa ${data.placa} foi adicionado.`,
    });
    form.reset();
  };
  
  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    setVehicleLog(prev => prev.filter(log => log.id !== vehicleId));
    toast({
      title: "Veículo Removido",
      description: "O registro do veículo foi removido da lista e do histórico.",
    });
  };

  const handleVehicleClick = (vehicle: VehicleWithStatus) => {
    const newType = vehicle.status === 'entry' ? 'exit' : 'entry';
    const translatedType = newType === 'entry' ? 'entrada' : 'saída';

    const newLogEntry: VehicleLogEntry = {
        ...vehicle,
        logId: `log_${new Date().getTime()}`,
        timestamp: new Date().toISOString(),
        type: newType,
    };
    
    setVehicleLog(prev => [newLogEntry, ...prev]);
    
    toast({
        title: "Movimentação Registrada!",
        description: `Registrada ${translatedType} para o veículo ${vehicle.placa}.`,
        className: newType === 'entry' ? 'bg-green-600 text-white' : 'bg-red-600 text-white',
    });
  }

  const vehiclesWithStatus: VehicleWithStatus[] = useMemo(() => {
    return vehicles.map(vehicle => {
      const lastLog = vehicleLog
        .filter(log => log.id === vehicle.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      return {
        ...vehicle,
        status: lastLog ? lastLog.type : 'exit', // Default to 'exit' if no log
      };
    });
  }, [vehicles, vehicleLog]);


  if (!isClient) {
    return null;
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
                <FormField
                  control={form.control}
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: BRA2E19" {...field} />
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
                    <VehicleHistory
                        log={vehicleLog}
                    />
                </TabsContent>
            </Tabs>
        </div>
      </div>
    </main>
  );
}
