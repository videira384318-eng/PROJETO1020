"use client";

import { useEffect, useState } from 'react';
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
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import type { VehicleLogEntry } from '@/app/veiculos/page';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const editLogFormSchema = z.object({
  condutor: z.string().min(1, "O nome do condutor é obrigatório."),
  date: z.date({
    required_error: "A data é obrigatória.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm).")
});

export type EditLogFormData = z.infer<typeof editLogFormSchema>;

interface EditVehicleLogDialogProps {
  isOpen: boolean;
  onClose: () => void;
  logEntry: VehicleLogEntry | null;
  onSubmit: (data: EditLogFormData) => void;
}

export function EditVehicleLogDialog({ isOpen, onClose, logEntry, onSubmit }: EditVehicleLogDialogProps) {
  const form = useForm<EditLogFormData>({
    resolver: zodResolver(editLogFormSchema),
  });

  useEffect(() => {
    if (logEntry) {
        const entryDate = new Date(logEntry.timestamp);
        form.reset({
            condutor: logEntry.condutor,
            date: entryDate,
            time: format(entryDate, "HH:mm"),
        });
    }
  }, [logEntry, form]);

  const handleFormSubmit = (data: EditLogFormData) => {
    onSubmit(data);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!logEntry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Registro de Histórico</DialogTitle>
          <DialogDescription>
            Ajuste os dados para o registro do veículo <span className="font-semibold">{logEntry.placa}</span>.
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
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora (HH:mm)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 14:30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4 sm:justify-start">
                     <Button type="submit">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
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
