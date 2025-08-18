
"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, LogOut, LogIn } from 'lucide-react';
import type { VehicleWithStatus } from '@/types';
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';

interface VehicleListProps {
  vehicles: VehicleWithStatus[];
  onExit: (vehicleId: string) => void;
  onReEnter: (vehicle: VehicleWithStatus) => void;
  selectedVehicles: string[];
  onToggleSelection: (vehicleId: string) => void;
  onToggleSelectAll: (filteredVehicles: VehicleWithStatus[]) => void;
  onDeleteSelected: () => void;
}

export function VehicleList({ 
    vehicles, 
    onExit,
    onReEnter,
    selectedVehicles,
    onToggleSelection,
    onToggleSelectAll,
    onDeleteSelected,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVehicles = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    // If there is a search term, filter all vehicles
    if (lowerCaseSearchTerm) {
      return vehicles
        .filter(vehicle => 
          (vehicle.plate || '').toLowerCase().includes(lowerCaseSearchTerm) ||
          (vehicle.model || '').toLowerCase().includes(lowerCaseSearchTerm)
        )
        .sort((a, b) => (a.plate || '').localeCompare(b.plate || ''));
    }

    // By default (no search term), show only vehicles that are 'entered'
    return vehicles
      .filter(vehicle => vehicle.status === 'entered')
      .sort((a, b) => (a.plate || '').localeCompare(b.plate || ''));
  }, [vehicles, searchTerm]);


   const numSelected = selectedVehicles.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="font-headline">Veículos Cadastrados</CardTitle>
            <CardDescription>Gerencie veículos e registre novas movimentações.</CardDescription>
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
                            Essa ação não pode ser desfeita. Isso excluirá permanentemente os {numSelected} veículo(s) selecionado(s) e todo o seu histórico de movimentações.
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
                placeholder="Pesquisar por placa ou modelo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <TooltipProvider>
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
                <TableHead>Pátio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhum veículo encontrado.' : 'Nenhum veículo presente no pátio.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id} data-state={selectedVehicles.includes(vehicle.id) ? 'selected' : ''} className="group">
                    <TableCell>
                        <Checkbox
                            checked={selectedVehicles.includes(vehicle.id)}
                            onCheckedChange={() => onToggleSelection(vehicle.id)}
                            aria-label={`Selecionar ${vehicle.plate}`}
                        />
                    </TableCell>
                    <TableCell className="font-mono">{vehicle.plate || 'N/A'}</TableCell>
                    <TableCell>{vehicle.model || 'N/A'}</TableCell>
                    <TableCell>{vehicle.status === 'entered' ? (vehicle.driverName || 'N/A') : 'N/A'}</TableCell>
                    <TableCell>{vehicle.status === 'entered' ? (vehicle.parkingLot || 'N/A') : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={vehicle.status === 'entered' ? 'success' : 'destructive'} className="capitalize">
                        {vehicle.status === 'entered' ? 'No Pátio' : 'Ausente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end">
                       {vehicle.status === 'exited' ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => onReEnter(vehicle)}>
                                    <LogIn className="mr-2 h-4 w-4"/>
                                    Registrar Entrada
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Registrar uma nova entrada para este veículo.</p>
                            </TooltipContent>
                        </Tooltip>
                        
                      ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => onExit(vehicle.id)}>
                                    <LogOut className="mr-2 h-4 w-4"/>
                                    Registrar Saída
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Registrar a saída para a movimentação atual.</p>
                            </TooltipContent>
                        </Tooltip>
                      )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
