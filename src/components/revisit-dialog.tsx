
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
import { User, LogIn } from 'lucide-react';
import type { Visitor } from '@/types';

const revisitFormSchema = z.object({
  plate: z.string().optional(),
  responsible: z.string().min(1, "O responsável é obrigatório."),
  reason: z.string().min(1, "O motivo da visita é obrigatório."),
  parkingLot: z.enum(['P1', 'P2'], {
    required_error: "Você precisa selecionar o pátio.",
  }),
});

export type RevisitFormData = z.infer<typeof revisitFormSchema>;

interface RevisitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: Visitor | null;
  onSubmit: (data: RevisitFormData) => void;
}

export function RevisitDialog({ isOpen, onClose, visitor, onSubmit }: RevisitDialogProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<RevisitFormData>({
    resolver: zodResolver(revisitFormSchema),
    defaultValues: {
      plate: '',
      responsible: '',
      reason: '',
      parkingLot: 'P1',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(); // Clear form on open
    }
  }, [isOpen, form]);

  const handleSubmit = (data: RevisitFormData) => {
    onSubmit(data);
    onClose();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const formElements = formRef.current?.elements;
      if (!formElements) return;

      const currentElement = e.target as HTMLElement;
      const currentIndex = Array.prototype.indexOf.call(formElements, currentElement);
      
      const nextElement = formElements[currentIndex + 1] as HTMLElement;
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!visitor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Registrar Nova Visita</DialogTitle>
          <DialogDescription>
            Confirme os detalhes da visita para <span className="font-semibold">{visitor.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Placa (Opcional)</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: BRA2E19" {...field} onKeyDown={handleKeyDown}/>
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
                    <FormLabel>Responsável na Empresa</FormLabel>
                    <FormControl>
                        <Input placeholder="Ex: João da Silva (TI)" {...field} onKeyDown={handleKeyDown}/>
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
                    <Input placeholder="Ex: Reunião com o setor de compras" {...field} onKeyDown={handleKeyDown} />
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
