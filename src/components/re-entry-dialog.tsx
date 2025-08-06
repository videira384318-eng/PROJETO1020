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
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LogIn } from 'lucide-react';
import type { VisitorFormData } from '@/app/visitantes/page';

const reEntryFormSchema = z.object({
  placa: z.string().optional(),
  responsavel: z.string().min(1, "O responsável pela visita é obrigatório."),
  motivo: z.string().min(1, "O motivo da visita é obrigatório."),
  portaria: z.enum(['p1', 'p2'], {
    required_error: "Selecione a portaria.",
  }),
});

export type ReEntryFormData = z.infer<typeof reEntryFormSchema>;

interface ReEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: VisitorFormData | null;
  onSubmit: (data: ReEntryFormData) => void;
}

export function ReEntryDialog({ isOpen, onClose, visitor, onSubmit }: ReEntryDialogProps) {
  const form = useForm<ReEntryFormData>({
    resolver: zodResolver(reEntryFormSchema),
    defaultValues: {
      placa: '',
      responsavel: '',
      motivo: '',
      portaria: 'p1',
    },
  });
  
  useEffect(() => {
    if (visitor) {
        form.reset({
            placa: visitor.placa || '',
            responsavel: visitor.responsavel || '',
            motivo: visitor.motivo || '',
            portaria: visitor.portaria || 'p1',
        });
    }
  }, [visitor, form]);

  const handleFormSubmit = (data: ReEntryFormData) => {
    onSubmit(data);
    form.reset();
  };

  if (!visitor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar Nova Entrada</DialogTitle>
          <DialogDescription>
            Confirme os dados da visita para <span className="font-semibold">{visitor.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Placa do Veículo (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: BRA2E19" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="responsavel"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Responsável pela Visita</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: João da Silva (TI)" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Visita</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Reunião com o setor de Vendas" {...field} />
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
                        <LogIn className="mr-2 h-4 w-4" />
                        Confirmar Entrada
                    </Button>
                     <DialogClose asChild>
                        <Button type="button" variant="ghost" onClick={onClose}>
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
