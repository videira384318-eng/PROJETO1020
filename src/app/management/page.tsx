
"use client";

import { useState, useEffect, useCallback } from 'react';
import { AppHeader } from '@/components/app-header';
import { useAuth } from '@/context/AuthContext';
import { UserList } from '@/components/user-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ExternalLink } from 'lucide-react';
import { getUsers, updateUserRole, deleteUser } from '@/services/userService';
import type { UserProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { EditUserDialog } from '@/components/user-management-dialogs';
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
} from "@/components/ui/alert-dialog"

export default function ManagementPage() {
    const { currentUser, userProfile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const { toast } = useToast();

    const canManageUsers = userProfile?.role === 'adm' || userProfile?.role === 'rh';

    const refreshUsers = useCallback(async () => {
        setIsLoading(true);
        if (!canManageUsers) {
            setIsLoading(false);
            return;
        }
        try {
            const userList = await getUsers();
            setUsers(userList);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Carregar",
                description: "Não foi possível buscar a lista de usuários.",
            });
        } finally {
            setIsLoading(false);
        }
    }, [canManageUsers, toast]);

    useEffect(() => {
        refreshUsers();
    }, [refreshUsers]);
    
    const handleEditUser = (user: UserProfile) => {
        setEditingUser(user);
    }
    
    const handleUpdateUserRole = async (uid: string, role: UserProfile['role']) => {
        try {
            await updateUserRole(uid, role);
            toast({
                title: "Usuário Atualizado!",
                description: `O perfil do usuário foi alterado para ${role}.`,
            });
            await refreshUsers();
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Atualizar",
                description: "Não foi possível alterar o perfil do usuário.",
            });
        } finally {
            setEditingUser(null);
        }
    }
    
    const handleDeleteUser = async (uid: string) => {
         try {
            await deleteUser(uid);
            toast({
                title: "Perfil Removido!",
                description: "O perfil do usuário foi removido do sistema. Lembre-se de removê-lo também do painel de Autenticação do Firebase.",
            });
            await refreshUsers();
        } catch (error) {
            console.error("Erro ao remover usuário:", error);
            toast({
                variant: "destructive",
                title: "Erro ao Remover",
                description: "Não foi possível remover o perfil do usuário.",
            });
        }
    }


    if (!canManageUsers) {
        return (
            <main className="container mx-auto p-4 md:p-8">
                <AppHeader
                    title="Acesso Negado"
                    description="Você não tem permissão para acessar esta página."
                    activePage="management"
                />
            </main>
        );
    }
    
     if (isLoading) {
        return (
            <main className="container mx-auto p-4 md:p-8">
                <AppHeader
                    title="Gerenciamento"
                    description="Adicione, edite e remova usuários do sistema."
                    activePage="management"
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-1">
                        <Skeleton className="h-48 w-full" />
                    </div>
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                </div>
            </main>
        )
    }


    return (
        <main className="container mx-auto p-4 md:p-8">
            <AppHeader
                title="Gerenciamento"
                description="Adicione, edite e remova usuários do sistema."
                activePage="management"
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Adicionar Novo Usuário</CardTitle>
                        <CardDescription>
                            Para garantir a segurança, novos usuários devem ser criados diretamente no painel do Firebase.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Clique no botão abaixo para abrir o painel de Autenticação.</li>
                            <li>Clique em "Adicionar usuário".</li>
                            <li>Preencha o email e senha.</li>
                            <li>Após criar, o usuário aparecerá nesta lista e você poderá definir seu perfil.</li>
                        </ol>
                        <Button asChild className="w-full mt-4">
                            <a href="https://console.firebase.google.com/project/controle-de-acesso-zd058/authentication/users" target="_blank" rel="noopener noreferrer">
                                <PlusCircle />
                                Adicionar Usuário no Firebase
                                <ExternalLink className="ml-auto"/>
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2">
                    <UserList 
                        users={users}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                        currentUserId={currentUser?.uid}
                    />
                </div>
            </div>
            
            <EditUserDialog 
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onSubmit={handleUpdateUserRole}
                currentUserRole={userProfile?.role}
            />
        </main>
    );
}
