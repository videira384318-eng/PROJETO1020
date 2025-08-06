"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Truck, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { VehicleFormData } from '@/app/veiculos/page';

interface VehicleListProps {
  vehicles: VehicleFormData[];
  onDelete: (vehicleId: string) => void;
}

export function VehicleList({ vehicles, onDelete }: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) {
      return vehicles;
    }
    return vehicles.filter(vehicle =>
      vehicle.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.condutor.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [vehicles, searchTerm]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Veículos Cadastrados</CardTitle>
                <CardDescription>Visualize e gerencie os veículos da empresa.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Pesquisar por placa ou condutor..." 
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {vehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
            <Truck className="h-10 w-10 mb-4" />
            <p className="font-semibold">Nenhum veículo cadastrado</p>
            <p className="text-sm">Use o formulário para adicionar o primeiro.</p>
          </div>
        ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                <Search className="h-10 w-10 mb-4" />
                <p className="font-semibold">Nenhum resultado encontrado</p>
                <p className="text-sm">Tente uma busca diferente.</p>
            </div>
        ) : (
          <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Condutor</TableHead>
                        <TableHead>Portaria</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredVehicles.map((vehicle) => (
                         <TableRow key={vehicle.id}>
                            <TableCell className="font-medium">{vehicle.placa}</TableCell>
                            <TableCell>{vehicle.condutor}</TableCell>
                            <TableCell>{vehicle.portaria.toUpperCase()}</TableCell>
                            <TableCell className="text-right">
                               <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Excluir Veículo</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Essa ação não pode ser desfeita. Isso excluirá permanentemente o registro do veículo.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => onDelete(vehicle.id!)}>Excluir</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
