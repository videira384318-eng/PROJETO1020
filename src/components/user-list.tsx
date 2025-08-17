
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { UserProfile } from "@/types";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Pencil, Trash2, User, UserCheck } from "lucide-react";
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

interface UserListProps {
    users: UserProfile[];
    onEdit: (user: UserProfile) => void;
    onDelete: (uid: string) => void;
    currentUserId?: string | null;
}

const roleDisplayMap = {
    adm: "Admin",
    rh: "RH",
    portaria: "Portaria",
    supervisao: "Supervisão"
};

export function UserList({ users, onEdit, onDelete, currentUserId }: UserListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>
                    Gerencie os perfis e permissões dos usuários.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        Nenhum usuário encontrado. Adicione usuários no painel do Firebase.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.uid}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {user.email}
                                            {user.uid === currentUserId && (
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    <UserCheck className="mr-1 h-3 w-3" />
                                                    Você
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{roleDisplayMap[user.role]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => onEdit(user)} disabled={user.uid === currentUserId}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Editar Perfil</span>
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={user.uid === currentUserId}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                        <span className="sr-only">Remover Usuário</span>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação removerá o perfil do usuário do sistema, mas não excluirá a conta de autenticação. Isso deve ser feito manualmente no Painel do Firebase.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(user.uid)}>Remover</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
