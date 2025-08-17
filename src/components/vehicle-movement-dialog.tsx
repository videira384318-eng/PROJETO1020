"use client";

import { useEffect } from 'react';
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
import { LogIn, LogOut } from 'lucide-react';
import type { VehicleWithStatus } from '@/components/vehicle-list';

const movementFormSchema = z.object({
  condutor: z.string().min(1, "O nome do condutor é obrigatório."),
  portaria: z.enum(['p1', 'p2'], {
    required_error: "Selecione a portaria.",
  }),
});

export type MovementFormData = z.infer<typeof movementFormSchema>;

interface VehicleMovementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleWithStatus | null;
  onSubmit: (data: MovementFormData) => void;
}

export function VehicleMovementDialog({ isOpen, onClose, vehicle, onSubmit }: VehicleMovementDialogProps) {
  const form = useForm<MovementFormData>({
    resolver: zodResolver(movementFormSchema),
  });

  useEffect(() => {
    if (vehicle) {
        form.reset({
            condutor: vehicle.condutor,
            portaria: vehicle.portaria,
        });
    }
  }, [vehicle, form]);

  const handleFormSubmit = (data: MovementFormData) => {
    onSubmit(data);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!vehicle) return null;

  const movementType = vehicle.status === 'entry' ? 'exit' : 'entry';
  const title = movementType === 'entry' ? 'Registrar Entrada' : 'Registrar Saída';
  const buttonText = movementType === 'entry' ? 'Confirmar Entrada' : 'Confirmar Saída';
  const Icon = movementType === 'entry' ? LogIn : LogOut;


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">{title}</DialogTitle>
          <DialogDescription>
            Confirme ou atualize os dados para a movimentação do veículo <span className="font-semibold">{vehicle.placa}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                      <FormLabel>Portaria</FormLabel>
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

                <DialogFooter className="pt-4 sm:justify-start">
                     <Button type="submit">
                        <Icon className="mr-2 h-4 w-4" />
                        {buttonText}
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
