
"use client";

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LogIn } from 'lucide-react';
import type { VehicleWithStatus, ReEnterVehicleFormData } from '@/types';

const reEnterVehicleFormSchema = z.object({
  driverName: z.string().min(1, "O nome do motorista é obrigatório."),
  parkingLot: z.enum(['P1', 'P2'], {
    required_error: "Você precisa selecionar o pátio.",
  }),
});


interface ReEnterVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleWithStatus | null;
  onSubmit: (data: ReEnterVehicleFormData) => void;
}

export function ReEnterVehicleDialog({ isOpen, onClose, vehicle, onSubmit }: ReEnterVehicleDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<ReEnterVehicleFormData>({
    resolver: zodResolver(reEnterVehicleFormSchema),
    defaultValues: {
        driverName: '',
        parkingLot: 'P1',
    }
  });

  useEffect(() => {
    if (vehicle) {
      // Pre-fill the form with the last visit's data
      form.reset({
        driverName: vehicle.driverName || '',
        parkingLot: vehicle.parkingLot || 'P1', 
      });
    }
  }, [vehicle, form, isOpen]); // Rerun when dialog opens

  const handleSubmit = (data: ReEnterVehicleFormData) => {
    onSubmit(data);
    onClose(); // This will also trigger the useEffect to reset the form next time
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar Nova Entrada</DialogTitle>
          <DialogDescription>
            Confirme os detalhes da entrada para o veículo <span className="font-semibold">{vehicle.plate} ({vehicle.model})</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="driverName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome do Motorista</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
              control={form.control}
              name="parkingLot"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Pátio</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="P1" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          P1
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="P2" />
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
            <DialogFooter className="pt-4 sm:justify-start">
              <Button type="submit">
                <LogIn className="mr-2 h-4 w-4" />
                Confirmar Entrada
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
