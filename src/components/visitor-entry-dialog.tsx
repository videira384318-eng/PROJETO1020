
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
import { User, PlusCircle } from 'lucide-react';
import type { Visitor } from '@/types';

const visitorFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  company: z.string().min(1, "A empresa é obrigatória."),
  rg: z.string().min(1, "O RG é obrigatório."),
  cpf: z.string().min(1, "O CPF é obrigatório."),
  plate: z.string().optional(),
  responsible: z.string().min(1, "O responsável é obrigatório."),
  reason: z.string().min(1, "O motivo da visita é obrigatório."),
  parkingLot: z.enum(['P1', 'P2'], {
    required_error: "Você precisa selecionar o pátio.",
  }),
});

type VisitorFormData = Omit<Visitor, 'id' | 'status' | 'entryTimestamp' | 'exitTimestamp'>;


interface VisitorEntryDialogProps {
  onSubmit: (data: VisitorFormData) => void;
}

export function VisitorEntryDialog({ onSubmit }: VisitorEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof visitorFormSchema>>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      company: '',
      rg: '',
      cpf: '',
      plate: '',
      responsible: '',
      reason: '',
    },
  });

  const handleSubmit = (data: z.infer<typeof visitorFormSchema>) => {
    onSubmit(data);
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Visitante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar Entrada de Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados do visitante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Maria dos Santos" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Empresa</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: Empresa Y" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="rg"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 12.345.678-9" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: 123.456.789-00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Placa (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: BRA2E19" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="responsible"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: João da Silva (TI)" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Visita</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reunião com o setor de compras" {...field} />
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
                <User className="mr-2 h-4 w-4" />
                Confirmar Entrada
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
