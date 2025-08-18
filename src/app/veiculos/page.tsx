
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Vehicle, VehicleLog, VehicleWithStatus, NewVehicleFormData, ReEnterVehicleFormData } from '@/types';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleList } from '@/components/vehicle-list';
import { VehicleEntryDialog } from '@/components/vehicle-entry-dialog';
import { ReEnterVehicleDialog } from '@/components/re-enter-vehicle-dialog';
import { VehicleLogHistory } from '@/components/vehicle-log-history';
import { addVehicle, getVehicles, deleteVehicles } from '@/services/vehicleService';
import { addVehicleLog, getVehicleLogs, updateVehicleLog, getLastLogForVehicle } from '@/services/vehicleLogService';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
  const [vehicleLogs, setVehicleLogs] = useState<VehicleLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [reenteringVehicle, setReenteringVehicle] = useState<VehicleWithStatus | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vehiclesData, logsData] = await Promise.all([
          getVehicles(),
          getVehicleLogs()
      ]);
      
      const vehiclesWithStatus: VehicleWithStatus[] = await Promise.all(
          vehiclesData.map(async (vehicle) => {
              const lastLog = await getLastLogForVehicle(vehicle.id);
              return {
                  ...vehicle,
                  status: lastLog?.status ?? 'exited',
                  lastLogId: lastLog?.id,
                  driverName: lastLog?.driverName,
                  parkingLot: lastLog?.parkingLot
              };
          })
      );

      setVehicles(vehiclesWithStatus.sort((a, b) => a.plate.localeCompare(b.plate)));
      setVehicleLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os dados de veículos ou de histórico.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVehicle = async (formData: NewVehicleFormData) => {
    try {
      // 1. Create the permanent vehicle record
      const vehicleData: Omit<Vehicle, 'id'> = {
        plate: formData.plate,
        model: formData.model,
      };
      const newVehicleId = await addVehicle(vehicleData);

      // 2. Create the first log for this vehicle
      await addVehicleLog({
          vehicleId: newVehicleId,
          vehiclePlate: formData.plate,
          vehicleModel: formData.model,
          driverName: formData.driverName,
          parkingLot: formData.parkingLot,
      });

      toast({
        title: "Veículo Cadastrado e Entrada Registrada!",
        description: `O veículo ${formData.plate} foi cadastrado e sua entrada foi registrada.`,
        className: 'bg-green-600 text-white'
      });
      fetchData();
    } catch (error) {
      console.error("Error adding vehicle and first log:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar veículo",
      });
    }
  };

  const handleReEnterVehicle = async (formData: ReEnterVehicleFormData) => {
    if (!reenteringVehicle) return;

    try {
        await addVehicleLog({
            vehicleId: reenteringVehicle.id,
            vehiclePlate: reenteringVehicle.plate,
            vehicleModel: reenteringVehicle.model,
            driverName: formData.driverName,
            parkingLot: formData.parkingLot,
        });

        toast({
            title: "Entrada Registrada!",
            description: `A nova entrada do veículo ${reenteringVehicle.plate} foi registrada.`,
            className: 'bg-green-600 text-white'
        });
        setReenteringVehicle(null);
        fetchData();

    } catch (error) {
        console.error("Error adding vehicle log:", error);
        toast({
            variant: "destructive",
            title: "Erro ao registrar entrada",
        });
    }
  };


  const handleExitVehicle = async (vehicleId: string) => {
     try {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle && vehicle.lastLogId) {
            await updateVehicleLog(vehicle.lastLogId, {
                status: 'exited',
                exitTimestamp: new Date().toISOString()
            });
            toast({
              title: "Saída Registrada!",
              description: `A saída do veículo ${vehicle.plate} foi registrada.`,
              className: 'bg-red-600 text-white',
            });
            fetchData();
        } else {
             throw new Error("Última movimentação não encontrada para registrar a saída.");
        }
    } catch (error) {
       console.error("Error updating vehicle exit:", error);
       toast({
        variant: "destructive",
        title: "Erro ao registrar saída",
      });
    }
  };

  const handleDeleteSelectedVehicles = async () => {
    try {
      await deleteVehicles(selectedVehicles);
      const count = selectedVehicles.length;
      setSelectedVehicles([]);
      toast({
          title: "Veículos Removidos",
          description: `Os ${count} veículo(s) selecionado(s) e seus históricos foram removidos.`,
      });
      fetchData();
    } catch (error) {
        console.error("Error deleting vehicles:", error);
        toast({
            variant: "destructive",
            title: "Erro ao remover veículos",
        });
    }
  };
  
  const handleReEnterClick = (vehicle: VehicleWithStatus) => {
      setReenteringVehicle(vehicle);
  }

  const handleToggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
      ? prev.filter(id => id !== vehicleId)
      : [...prev, vehicleId]
    );
  };
  
  const handleToggleSelectAll = (filteredVehicles: VehicleWithStatus[]) => {
    if (selectedVehicles.length === filteredVehicles.length) {
      setSelectedVehicles([]);
    } else {
      setSelectedVehicles(filteredVehicles.map(v => v.id));
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Skeleton className="h-10 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </main>
    );
  }

  return (
    <>
    <main className="container mx-auto p-4 md:p-8">
      <AppHeader
        title="Controle de Veículos"
        description="Gerencie o cadastro e o fluxo de veículos."
      >
        <VehicleEntryDialog onSubmit={handleAddVehicle} />
      </AppHeader>

      <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vehicles">Veículos</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles">
                <VehicleList
                    vehicles={vehicles}
                    onReEnter={handleReEnterClick}
                    onExit={handleExitVehicle}
                    selectedVehicles={selectedVehicles}
                    onToggleSelection={handleToggleVehicleSelection}
                    onToggleSelectAll={handleToggleSelectAll}
                    onDeleteSelected={handleDeleteSelectedVehicles}
                />
            </TabsContent>
            <TabsContent value="history">
                <VehicleLogHistory logs={vehicleLogs} />
            </TabsContent>
        </Tabs>
    </main>
    <ReEnterVehicleDialog
      isOpen={!!reenteringVehicle}
      onClose={() => setReenteringVehicle(null)}
      vehicle={reenteringVehicle}
      onSubmit={handleReEnterVehicle}
    />
    </>
  );
}
