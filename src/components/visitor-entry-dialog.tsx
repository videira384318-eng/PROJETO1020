
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
import { User, PlusCircle } from 'lucide-react';
import type { Visitor } from '@/types';

const visitorFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  document: z.string().min(1, "O documento é obrigatório."),
  company: z.string().min(1, "A empresa é obrigatória."),
  reason: z.string().min(1, "O motivo da visita é obrigatório."),
});

type VisitorFormData = z.infer<typeof visitorFormSchema>;

interface VisitorEntryDialogProps {
  onSubmit: (data: VisitorFormData) => void;
}

export function VisitorEntryDialog({ onSubmit }: VisitorEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      document: '',
      company: '',
      reason: '',
    },
  });

  const handleSubmit = (data: VisitorFormData) => {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar Entrada de Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados do visitante.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
              name="document"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documento (RG ou CPF)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 12.345.678-9" {...field} />
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
