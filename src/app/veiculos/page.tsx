"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, Truck } from 'lucide-react';
import { VehicleList } from '@/components/vehicle-list';
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from '@/components/app-header';

const vehicleFormSchema = z.object({
  id: z.string().optional(),
  placa: z.string().min(1, "A placa é obrigatória."),
  condutor: z.string().min(1, "O nome do condutor é obrigatório."),
  portaria: z.enum(['p1', 'p2'], {
    required_error: "Selecione a portaria.",
  }),
});

export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleFormData[]>([]);
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
            localStorage.removeItem('qr-attendance-vehicles');
        }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles, isClient]);

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
    toast({
      title: "Veículo Removido",
      description: "O registro do veículo foi removido da lista.",
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
       <AppHeader
        title="Cadastro de Veículos"
        description="Registre e gerencie os veículos da empresa."
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
                      <FormLabel>Portaria de Acesso Comum</FormLabel>
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
            <VehicleList 
                vehicles={vehicles}
                onDelete={handleDeleteVehicle}
            />
        </div>
      </div>
    </main>
  );
}
