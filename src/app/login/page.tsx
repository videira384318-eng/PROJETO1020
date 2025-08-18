
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { signInUser } from '@/services/authService';
import { Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';
import { FirebaseError } from 'firebase/app';

const loginFormSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const handleAuthError = (error: any) => {
      let title = "Falha no Login";
      let description = "Ocorreu um erro inesperado. Por favor, tente novamente.";

      if (error instanceof FirebaseError) {
          switch (error.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  description = "Email ou senha incorretos. Por favor, verifique seus dados e tente novamente.";
                  break;
              case 'auth/invalid-email':
                  description = "O formato do email é inválido. Por favor, verifique o email digitado.";
                  break;
              default:
                  description = `Ocorreu um erro: ${error.message}`;
                  break;
          }
      }
      
      toast({
          variant: "destructive",
          title: title,
          description: description,
      });
  }

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
        await signInUser(data.email, data.password);
        // Redirect to the authenticating page instead of root
        router.push('/authenticating'); 
    } catch (error: any) {
        console.error("Erro no login:", error);
        handleAuthError(error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-8 left-8">
            <h1 className="text-2xl font-bold font-headline text-primary">Controle de Acesso</h1>
        </div>
        <Card className="w-full max-w-sm">
            <CardHeader>
            <CardTitle className="text-2xl font-headline">Login</CardTitle>
            <CardDescription>
                Acesse o painel de controle com seu email e senha.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Entrar
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
         <Card className="w-full max-w-sm mt-4 text-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Não tem um login?</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Para criar um novo usuário, o administrador do sistema deve adicioná-lo através do <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">painel do Firebase</a> e depois definir as permissões na tela de Gerenciamento do aplicativo.
                </p>
            </CardContent>
        </Card>
    </main>
  );
}
