
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
import { Save } from 'lucide-react';
import type { Visitor } from '@/types';

const editVisitorFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "O nome é obrigatório."),
  company: z.string().min(1, "A empresa é obrigatória."),
  rg: z.string().min(1, "O RG é obrigatório."),
  cpf: z.string().min(1, "O CPF é obrigatório."),
});

type EditVisitorFormData = z.infer<typeof editVisitorFormSchema>;

interface EditVisitorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  visitor: Visitor | null;
  onSubmit: (data: Visitor) => void;
}

export function EditVisitorDialog({ isOpen, onClose, visitor, onSubmit }: EditVisitorDialogProps) {
  const form = useForm<EditVisitorFormData>({
    resolver: zodResolver(editVisitorFormSchema),
  });

  useEffect(() => {
    if (visitor) {
        form.reset({
            ...visitor,
        });
    }
  }, [visitor, form]);

  const handleFormSubmit = (data: EditVisitorFormData) => {
    onSubmit(data as Visitor);
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
          <DialogTitle className="font-headline">Editar Visitante</DialogTitle>
          <DialogDescription>
            Altere os dados cadastrais de <span className="font-semibold">{visitor.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
