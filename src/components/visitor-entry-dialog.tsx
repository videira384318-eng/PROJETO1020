
"use client";

import { useState, useRef } from 'react';
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
import type { NewVisitorFormData } from '@/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const newVisitorFormSchema = z.object({
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

interface VisitorEntryDialogProps {
  onSubmit: (data: NewVisitorFormData) => void;
}

export function VisitorEntryDialog({ onSubmit }: VisitorEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<NewVisitorFormData>({
    resolver: zodResolver(newVisitorFormSchema),
    defaultValues: {
      name: '',
      company: '',
      rg: '',
      cpf: '',
      plate: '',
      responsible: '',
      reason: '',
      parkingLot: 'P1',
    },
  });

  const handleSubmit = (data: NewVisitorFormData) => {
    onSubmit(data);
    form.reset();
    setIsOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Prevent Enter from submitting in textarea
      e.preventDefault();
      const formElements = formRef.current?.elements;
      if (!formElements) return;

      const currentElement = e.target as HTMLElement;
      const currentIndex = Array.prototype.indexOf.call(formElements, currentElement);
      
      // Find the next focusable element
      let nextIndex = currentIndex + 1;
      while(formElements[nextIndex]) {
          const nextElement = formElements[nextIndex] as HTMLElement;
          // Check if the element is focusable and not disabled
          if (nextElement.tabIndex !== -1 && !(nextElement as HTMLInputElement).disabled) {
              nextElement.focus();
              return;
          }
          nextIndex++;
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Visitante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Cadastrar Novo Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados do visitante e os detalhes da visita inicial.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
                <legend className="text-lg font-medium mb-2 col-span-full">Dados do Visitante</legend>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: Maria dos Santos" {...field} onKeyDown={handleKeyDown}/>
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
                            <Input placeholder="Ex: Empresa Y" {...field} onKeyDown={handleKeyDown} />
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
                            <Input placeholder="Ex: 12.345.678-9" {...field} onKeyDown={handleKeyDown} />
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
                            <Input placeholder="Ex: 123.456.789-00" {...field} onKeyDown={handleKeyDown}/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </fieldset>
             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <legend className="text-lg font-medium mb-2 col-span-full">Detalhes da Visita</legend>
                <FormField
                    control={form.control}
                    name="plate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Placa (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: BRA2E19" {...field} onKeyDown={handleKeyDown} />
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
                            <Input placeholder="Ex: João da Silva (TI)" {...field} onKeyDown={handleKeyDown} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                        <FormItem className="col-span-full">
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
                        <FormItem className="space-y-3 col-span-full">
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
             </fieldset>
            <DialogFooter className="pt-4 sm:justify-start sticky bottom-0 bg-background py-4">
              <Button type="submit">
                <User className="mr-2 h-4 w-4" />
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
