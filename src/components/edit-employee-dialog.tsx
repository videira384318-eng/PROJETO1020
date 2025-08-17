
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
import type { QrFormData } from './qr-generator';
import { Switch } from './ui/switch';

const editEmployeeFormSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "O nome é obrigatório."),
  setor: z.string().min(1, "O setor é obrigatório."),
  placa: z.string().optional(),
  ramal: z.string().optional(),
  active: z.boolean().optional(),
});

interface EditEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee: QrFormData | null;
  onSubmit: (data: QrFormData) => void;
}

export function EditEmployeeDialog({ isOpen, onClose, employee, onSubmit }: EditEmployeeDialogProps) {
  const form = useForm<QrFormData>({
    resolver: zodResolver(editEmployeeFormSchema),
  });

  useEffect(() => {
    if (employee) {
        // Ensure 'active' field has a default value if it's missing for older records
        form.reset({
            ...employee,
            active: employee.active ?? true,
        });
    }
  }, [employee, form]);

  const handleFormSubmit = (data: QrFormData) => {
    onSubmit(data);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Funcionário</DialogTitle>
          <DialogDescription>
            Altere os dados de <span className="font-semibold">{employee.nome}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="nome"
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
                    name="setor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>QR Code Ativo</FormLabel>
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
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
