
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Vehicle } from '@/types';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleList } from '@/components/vehicle-list';
import { VehicleEntryDialog } from '@/components/vehicle-entry-dialog';
import { addVehicle, getVehicles, updateVehicle, deleteVehicles } from '@/services/vehicleService';
import { useToast } from "@/hooks/use-toast";

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const vehiclesData = await getVehicles();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar veículos",
        description: "Não foi possível buscar os dados de veículos.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'status' | 'entryTimestamp' | 'exitTimestamp'>) => {
    try {
      await addVehicle(vehicleData);
      toast({
        title: "Veículo Registrado!",
        description: `A entrada de ${vehicleData.model} (${vehicleData.plate}) foi registrada.`,
        className: 'bg-green-600 text-white'
      });
      fetchData();
    } catch (error) {
      console.error("Error adding vehicle:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar veículo",
      });
    }
  };

  const handleExitVehicle = async (vehicleId: string) => {
     try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        await updateVehicle(vehicleId, { 
          ...vehicle, 
          status: 'exited', 
          exitTimestamp: new Date().toISOString() 
        });
        toast({
          title: "Saída Registrada!",
          description: `A saída do veículo ${vehicle.plate} foi registrada.`,
           className: 'bg-red-600 text-white',
        });
        fetchData();
      }
    } catch (error) {
       console.error("Error updating vehicle:", error);
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
          description: `Os ${count} veículo(s) selecionado(s) foram removidos.`,
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

  const handleToggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicles(prev => 
      prev.includes(vehicleId) 
      ? prev.filter(id => id !== vehicleId)
      : [...prev, vehicleId]
    );
  };

  const handleToggleSelectAll = (filteredVehicles: Vehicle[]) => {
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
    <main className="container mx-auto p-4 md:p-8">
      <AppHeader
        title="Controle de Veículos"
        description="Gerencie a entrada e saída de veículos."
      >
        <VehicleEntryDialog onSubmit={handleAddVehicle} />
      </AppHeader>
      <VehicleList
        vehicles={vehicles}
        onExit={handleExitVehicle}
        selectedVehicles={selectedVehicles}
        onToggleSelection={handleToggleVehicleSelection}
        onToggleSelectAll={handleToggleSelectAll}
        onDeleteSelected={handleDeleteSelectedVehicles}
      />
    </main>
  );
}
