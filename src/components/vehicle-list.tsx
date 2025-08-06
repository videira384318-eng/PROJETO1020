"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Truck, Search, LogIn, LogOut } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

export interface VehicleWithStatus extends VehicleFormData {
  status: 'entry' | 'exit';
}

interface VehicleListProps {
  vehicles: VehicleWithStatus[];
  onDelete: (vehicleId: string) => void;
  onVehicleClick: (vehicle: VehicleWithStatus) => void;
}

export function VehicleList({ vehicles, onDelete, onVehicleClick }: VehicleListProps) {
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
  
  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <CardTitle className="font-headline">Veículos Cadastrados</CardTitle>
                <CardDescription>Clique em um veículo para registrar entrada/saída.</CardDescription>
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
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredVehicles.map((vehicle) => (
                         <TableRow key={vehicle.id} onClick={() => onVehicleClick(vehicle)} className="cursor-pointer">
                            <TableCell className="font-medium">{vehicle.placa}</TableCell>
                            <TableCell>{vehicle.condutor}</TableCell>
                            <TableCell>{vehicle.portaria.toUpperCase()}</TableCell>
                             <TableCell>
                                <Badge variant={vehicle.status === 'entry' ? 'success' : 'destructive'} className="capitalize flex items-center gap-1.5 w-fit text-xs px-2 py-0.5">
                                    {vehicle.status === 'entry' ? <LogIn size={12}/> : <LogOut size={12}/>}
                                    {vehicle.status === 'entry' ? 'Dentro' : 'Fora'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right" onClick={stopPropagation}>
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
