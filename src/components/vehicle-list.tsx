
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Car, Search, LogIn, LogOut } from 'lucide-react';
import type { Vehicle } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from './ui/checkbox';
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

interface VehicleListProps {
  vehicles: Vehicle[];
  onExit: (vehicleId: string) => void;
  selectedVehicles: string[];
  onToggleSelection: (vehicleId: string) => void;
  onToggleSelectAll: (filteredVehicles: Vehicle[]) => void;
  onDeleteSelected: () => void;
}

export function VehicleList({ 
    vehicles, 
    onExit,
    selectedVehicles,
    onToggleSelection,
    onToggleSelectAll,
    onDeleteSelected,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'inside' | 'all'>('inside');

  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter(vehicle => {
        const matchesFilter = filter === 'all' || vehicle.status === 'entered';
        const matchesSearch = !searchTerm || 
          vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.company.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => new Date(b.entryTimestamp).getTime() - new Date(a.entryTimestamp).getTime());
  }, [vehicles, searchTerm, filter]);

  const numSelected = selectedVehicles.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="font-headline">Veículos no Pátio</CardTitle>
            <CardDescription>Visualize e gerencie os veículos presentes.</CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {numSelected > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir ({numSelected})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente os {numSelected} registro(s) de veículo(s) selecionado(s).
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeleteSelected}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar veículo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
             <Button 
                variant={filter === 'inside' ? 'secondary' : 'outline'}
                onClick={() => setFilter('inside')}
            >
                No Pátio
            </Button>
            <Button 
                variant={filter === 'all' ? 'secondary' : 'outline'}
                onClick={() => setFilter('all')}
            >
                Histórico
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                    <Checkbox 
                        checked={filteredVehicles.length > 0 && numSelected === filteredVehicles.length}
                        indeterminate={numSelected > 0 && numSelected < filteredVehicles.length}
                        onCheckedChange={() => onToggleSelectAll(filteredVehicles)}
                    />
                </TableHead>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Entrada</TableHead>
                 <TableHead>Saída</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhum veículo encontrado.' : 'Nenhum veículo registrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} data-state={selectedVehicles.includes(vehicle.id) ? 'selected' : ''}>
                     <TableCell>
                        <Checkbox
                            checked={selectedVehicles.includes(vehicle.id)}
                            onCheckedChange={() => onToggleSelection(vehicle.id)}
                            aria-label={`Selecionar ${vehicle.plate}`}
                        />
                    </TableCell>
                    <TableCell className="font-mono">{vehicle.plate}</TableCell>
                    <TableCell>{vehicle.model}</TableCell>
                    <TableCell>{vehicle.driverName}</TableCell>
                    <TableCell>{vehicle.company}</TableCell>
                    <TableCell>{new Date(vehicle.entryTimestamp).toLocaleString()}</TableCell>
                    <TableCell>
                        {vehicle.exitTimestamp ? new Date(vehicle.exitTimestamp).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === 'entered' ? 'success' : 'destructive'} className="capitalize">
                        {vehicle.status === 'entered' ? 'No Pátio' : 'Saiu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {vehicle.status === 'entered' && (
                        <Button variant="destructive" size="sm" onClick={() => onExit(vehicle.id)}>
                          <LogOut className="mr-2 h-4 w-4"/>
                          Registrar Saída
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

