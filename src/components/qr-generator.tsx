"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import QRCode from 'qrcode';
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
import { QrCode, Printer, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';


const qrFormSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  setor: z.string().min(1, "O setor é obrigatório."),
  placa: z.string().optional(),
  ramal: z.string().optional(),
});

export type QrFormData = z.infer<typeof qrFormSchema>;

interface QRGeneratorProps {
    onAddEmployee: (data: QrFormData) => void;
}

export function QRGenerator({ onAddEmployee }: QRGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<QrFormData>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: {
      nome: '',
      setor: '',
      placa: '',
      ramal: '',
    },
  });

  const handleGenerate = (data: QrFormData) => {
    onAddEmployee(data);
    toast({
        title: "Funcionário Adicionado!",
        description: `${data.nome} foi adicionado(a) à lista.`
    })
    form.reset();
    setIsOpen(false);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Adicionar Novo Funcionário</DialogTitle>
          <DialogDescription>
            Preencha os dados para gerar um QR code e adicioná-lo à lista.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="setor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: TI, RH, Financeiro" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="placa"
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
                    name="ramal"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ramal (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 1234" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <DialogFooter className="pt-4 sm:justify-start">
                     <Button type="submit">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar à Lista
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
