
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

const visitorFormSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório."),
  company: z.string().min(1, "A empresa é obrigatória."),
  rg: z.string().min(1, "O RG é obrigatório."),
  cpf: z.string().min(1, "O CPF é obrigatório."),
});

type VisitorFormData = z.infer<typeof visitorFormSchema>;

interface VisitorEntryDialogProps {
  onSubmit: (data: VisitorFormData) => void;
}

export function VisitorEntryDialog({ onSubmit }: VisitorEntryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      company: '',
      rg: '',
      cpf: '',
    },
  });

  const handleSubmit = (data: VisitorFormData) => {
    onSubmit(data);
    form.reset();
    setIsOpen(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Visitante
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Cadastrar Novo Visitante</DialogTitle>
          <DialogDescription>
            Preencha os dados permanentes do visitante. Pressione Enter para ir ao próximo campo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            <DialogFooter className="pt-4 sm:justify-start">
              <Button type="submit">
                <User className="mr-2 h-4 w-4" />
                Salvar Visitante
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
