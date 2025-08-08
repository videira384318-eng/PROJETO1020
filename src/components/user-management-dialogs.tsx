
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Save } from 'lucide-react';
import type { UserProfile } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const editUserFormSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  role: z.enum(['adm', 'rh', 'portaria', 'supervisao']),
});

type EditUserFormData = z.infer<typeof editUserFormSchema>;

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onSubmit: (uid: string, role: UserProfile['role']) => void;
}

export function EditUserDialog({ isOpen, onClose, user, onSubmit }: EditUserDialogProps) {
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
  });

  useEffect(() => {
    if (user) {
        form.reset({
            uid: user.uid,
            email: user.email,
            role: user.role,
        });
    }
  }, [user, form]);

  const handleFormSubmit = (data: EditUserFormData) => {
    onSubmit(data.uid, data.role);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Editar Perfil do Usuário</DialogTitle>
          <DialogDescription>
            Alterar o perfil de <span className="font-semibold">{user.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Perfil de Acesso</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um perfil" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="adm">Admin</SelectItem>
                                <SelectItem value="rh">RH</SelectItem>
                                <SelectItem value="portaria">Portaria</SelectItem>
                                <SelectItem value="supervisao">Supervisão</SelectItem>
                            </SelectContent>
                        </Select>
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
