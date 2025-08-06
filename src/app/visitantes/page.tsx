"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Users } from 'lucide-react';
import { VisitorList } from '@/components/visitor-list';
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from '@/components/app-header';

const visitorFormSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome é obrigatório."),
  documento: z.string().min(1, "O documento é obrigatório."),
  empresa: z.string().min(1, "A empresa é obrigatória."),
  motivo: z.string().min(1, "O motivo da visita é obrigatório."),
  createdAt: z.string().optional(),
});

export type VisitorFormData = z.infer<typeof visitorFormSchema>;

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<VisitorFormData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      nome: '',
      documento: '',
      empresa: '',
      motivo: '',
    },
  });

  useEffect(() => {
    setIsClient(true);
    const storedVisitors = localStorage.getItem('qr-attendance-visitors');
    if (storedVisitors) {
      setVisitors(JSON.parse(storedVisitors));
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-visitors', JSON.stringify(visitors));
    }
  }, [visitors, isClient]);

  const handleAddVisitor = (data: VisitorFormData) => {
    const newVisitor: VisitorFormData = {
      ...data,
      id: `visitor_${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
    };
    setVisitors(prev => [newVisitor, ...prev]);
    toast({
      title: "Visitante Cadastrado!",
      description: `${data.nome} foi adicionado(a) à lista de visitantes.`,
    });
    form.reset();
  };

  const handleDeleteVisitor = (visitorId: string) => {
    setVisitors(prev => prev.filter(v => v.id !== visitorId));
    toast({
      title: "Visitante Removido",
      description: "O registro do visitante foi removido da lista.",
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
       <AppHeader
        title="Cadastro de Visitantes"
        description="Registre e gerencie a entrada de visitantes."
        activePage="visitors"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Users className="h-6 w-6"/> Novo Visitante</CardTitle>
            <CardDescription>Preencha os dados abaixo para registrar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddVisitor)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maria dos Santos" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Documento (RG/CPF)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12.345.678-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="motivo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Motivo da Visita</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Reunião com o setor de Vendas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Salvar Visitante
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <VisitorList visitors={visitors} onDelete={handleDeleteVisitor} />
        </div>
      </div>
    </main>
  );
}
