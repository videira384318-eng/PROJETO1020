
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
import { signInUser, signUpUser } from '@/services/authService';
import { Loader2, LogIn } from 'lucide-react';
import Image from 'next/image';

const loginFormSchema = z.object({
  email: z.string().email("Por favor, insira um email válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false); // For dev purposes
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
        await signInUser(data.email, data.password);
        toast({
            title: "Login bem-sucedido!",
            description: "Redirecionando para o painel.",
            className: "bg-green-600 text-white"
        });
        router.push('/');
    } catch (error: any) {
        console.error("Erro no login:", error);
        toast({
            variant: "destructive",
            title: "Falha no Login",
            description: "Email ou senha incorretos. Por favor, tente novamente.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  // This is a temporary function for development to create the first user
  const handleSignUp = async () => {
      const data = form.getValues();
      if (!data.email || !data.password) {
          toast({ variant: "destructive", title: "Erro", description: "Preencha email e senha para criar uma conta."});
          return;
      }
      setIsLoading(true);
      try {
          await signUpUser(data.email, data.password, 'adm');
          toast({ title: "Usuário Criado!", description: "Agora você pode fazer o login com essas credenciais."});
      } catch (error: any) {
          toast({ variant: "destructive", title: "Erro ao Criar Usuário", description: error.message });
      } finally {
          setIsLoading(false);
      }
  }

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
                <div className="flex flex-col gap-2">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Entrar
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={isLoading}>
                        Criar Usuário Admin (Dev)
                    </Button>
                </div>
                </form>
            </Form>
            </CardContent>
        </Card>
    </main>
  );
}
