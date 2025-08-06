
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, UserPlus, Users, KeyRound, AtSign } from 'lucide-react';
import type { User } from '@/services/userService';
import type { Role } from '@/contexts/auth-context';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
}

const userFormSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("O e-mail é inválido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  role: z.enum(['rh', 'portaria'], { required_error: "O perfil é obrigatório." }),
});

const editUserFormSchema = z.object({
    email: z.string().email("O e-mail é inválido.").optional(),
    role: z.enum(['rh', 'portaria'], { required_error: "O perfil é obrigatório." }).optional(),
})


type UserFormData = z.infer<typeof userFormSchema>;
type EditUserFormData = z.infer<typeof editUserFormSchema>;


export function UserManagement({ users, onAddUser, onUpdateUser, onDeleteUser }: UserManagementProps) {
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'portaria',
    },
  });

  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema),
  });

  const handleAddNewUser = (data: UserFormData) => {
    onAddUser({ email: data.email, password: data.password, role: data.role as Role });
    form.reset();
    setIsNewUserDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    editForm.reset({
        email: user.email,
        role: user.role,
    });
    setIsEditDialogOpen(true);
  }

  const handleUpdateSubmit = (data: EditUserFormData) => {
    if (!editingUser) return;
    
    const updateData: Partial<User> = {};
    if (data.email && data.email !== editingUser.email) {
        updateData.email = data.email;
    }
    if (data.role && data.role !== editingUser.role) {
        updateData.role = data.role as Role;
    }

    if (Object.keys(updateData).length > 0) {
        onUpdateUser(editingUser.id, updateData);
    }
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-headline flex items-center gap-2"><Users /> Usuários do Sistema</CardTitle>
          <CardDescription>Gerencie os acessos e perfis dos usuários.</CardDescription>
        </div>
        <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>Preencha os dados para criar um novo acesso.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddNewUser)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>E-mail do Usuário</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="email" placeholder="ex: joao@empresa.com" {...field} className="pl-9"/>
                          </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                             <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                             <Input type="password" placeholder="Mínimo 6 caracteres" {...field} className="pl-9" />
                          </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
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
                                <SelectItem value="rh">RH</SelectItem>
                                <SelectItem value="portaria">Portaria</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsNewUserDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit"><PlusCircle className="mr-2"/>Criar Usuário</Button>
                 </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>E-mail do Usuário</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 && (
                         <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                            Nenhum usuário cadastrado.
                            </TableCell>
                        </TableRow>
                    )}
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.email}</TableCell>
                            <TableCell className="uppercase">{user.role}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Editar</span>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                            <span className="sr-only">Excluir</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário <span className="font-bold">{user.email}</span>.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => onDeleteUser(user.id)}>Excluir</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Usuário: {editingUser?.email}</DialogTitle>
              <DialogDescription>Altere as informações do usuário abaixo. A senha não pode ser alterada aqui.</DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleUpdateSubmit)} className="space-y-4">
                 <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>E-mail do Usuário</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="email" {...field} className="pl-9"/>
                          </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                  <FormField
                    control={editForm.control}
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
                                <SelectItem value="rh">RH</SelectItem>
                                <SelectItem value="portaria">Portaria</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                 <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit"><Edit className="mr-2"/>Salvar Alterações</Button>
                 </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
