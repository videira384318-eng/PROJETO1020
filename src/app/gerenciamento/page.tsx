
"use client";

import { useState, useEffect } from 'react';
import type { User } from '@/services/userService';
import { getUsers, addUser, updateUser, deleteUser } from '@/services/userService';
import { useAuth } from '@/contexts/auth-context';
import { AppHeader } from '@/components/app-header';
import { UserManagement } from '@/components/user-management';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldOff } from 'lucide-react';


export default function GerenciamentoPage() {
  const { role } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (role !== 'adm') {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar esta página.",
      });
      router.push('/');
      return;
    }

    const unsubscribe = getUsers((allUsers) => {
        // Filter out the current adm user from the list to prevent self-modification
        const filteredUsers = allUsers.filter(u => u.username.toLowerCase() !== 'adm');
        setUsers(filteredUsers);
    });

    return () => unsubscribe();
  }, [role, router, toast]);
  
  const handleAddUser = async (user: Omit<User, 'id'>) => {
    try {
        await addUser(user);
        toast({
            title: "Usuário Adicionado!",
            description: `O usuário ${user.username} foi criado com sucesso.`
        });
    } catch(e) {
        console.error("Erro ao adicionar usuário: ", e);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o usuário.' });
    }
  };

  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    try {
        await updateUser(id, data);
        toast({
            title: "Usuário Atualizado!",
            description: `As informações foram atualizadas com sucesso.`
        });
    } catch (e) {
        console.error("Erro ao atualizar usuário: ", e);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o usuário.' });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
        await deleteUser(id);
         toast({
            title: "Usuário Removido!",
            description: `O usuário foi removido com sucesso.`
        });
    } catch (e) {
        console.error("Erro ao remover usuário: ", e);
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível remover o usuário.' });
    }
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }
  
  if (role !== 'adm') {
      return (
        <main className="container mx-auto p-4 md:p-8 flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-destructive"><ShieldOff /> Acesso Restrito</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Você não tem permissão para visualizar esta página. Você será redirecionado.</p>
                </CardContent>
            </Card>
        </main>
      )
  }


  return (
    <main className="container mx-auto p-4 md:p-8">
       <AppHeader
        title="Gerenciamento de Usuários"
        description="Adicione, edite e remova usuários e seus perfis."
        activePage="management"
      />
      <div className="mt-8">
        <UserManagement
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
        />
      </div>
    </main>
  );
}
