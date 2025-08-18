
"use client";

import { useState } from 'react';
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
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Car, PlusCircle } from 'lucide-react';
import type { NewVehicleFormData } from '@/types';

const newVehicleFormSchema = z.object({
  plate: z.string().min(7, "A placa deve ter no mínimo 7 caracteres.").max(8, "A placa deve ter no máximo 8 caracteres."),
  model: z.string().min(1, "O modelo é obrigatório."),
  driverName: z.string().min(1, "O nome do motorista é obrigatório."),
  parkingLot: z.enum(['P1', 'P2'], {
    required_error: "Você precisa selecionar o pátio.",
  }),
});

interface VehicleEntryDialogProps {
  onSubmit: (data: NewVehicleFormData) => void;
}

export function VehicleEntryDialog({ onSubmit }: VehicleEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<NewVehicleFormData>({
    resolver: zodResolver(newVehicleFormSchema),
    defaultValues: {
      plate: '',
      model: '',
      driverName: '',
      parkingLot: 'P1',
    },
  });

  const handleSubmit = (data: NewVehicleFormData) => {
    onSubmit(data);
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Cadastrar Novo Veículo</DialogTitle>
          <DialogDescription>
            Preencha os dados do veículo e da primeira movimentação.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="plate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placa</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-1234" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo do Veículo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Scania R450" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                <Car className="mr-2 h-4 w-4" />
                Salvar e Registrar Entrada
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
