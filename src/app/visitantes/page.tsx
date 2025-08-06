"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PlusCircle, Users } from 'lucide-react';
import { VisitorList } from '@/components/visitor-list';
import { VisitorHistory } from '@/components/visitor-history';
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from '@/components/app-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReEntryDialog, type ReEntryFormData } from '@/components/re-entry-dialog';

const visitorFormSchema = z.object({
  id: z.string().optional(),
  // Add a unique identifier for the person, not the visit
  personId: z.string().optional(),
  nome: z.string().min(1, "O nome é obrigatório."),
  rg: z.string().min(1, "O RG é obrigatório."),
  cpf: z.string().min(1, "O CPF é obrigatório."),
  empresa: z.string().min(1, "A empresa é obrigatória."),
  placa: z.string().optional(),
  responsavel: z.string().min(1, "O responsável pela visita é obrigatório."),
  motivo: z.string().min(1, "O motivo da visita é obrigatório."),
  portaria: z.enum(['p1', 'p2'], {
    required_error: "Selecione a portaria.",
  }),
  createdAt: z.string().optional(),
  entryTime: z.string().optional(),
  exitTime: z.string().optional(),
  status: z.enum(['inside', 'exited']).optional(),
});

export type VisitorFormData = z.infer<typeof visitorFormSchema>;

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<VisitorFormData[]>([]);
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [reEntryVisitor, setReEntryVisitor] = useState<VisitorFormData | null>(null);
  const { toast } = useToast();

  const form = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      nome: '',
      rg: '',
      cpf: '',
      empresa: '',
      placa: '',
      responsavel: '',
      motivo: '',
      portaria: 'p1',
    },
  });

  useEffect(() => {
    setIsClient(true);
    const storedVisitors = localStorage.getItem('qr-attendance-visitors');
    if (storedVisitors) {
        try {
            setVisitors(JSON.parse(storedVisitors));
        } catch (error) {
            console.error("Falha ao analisar os visitantes do localStorage", error);
            localStorage.removeItem('qr-attendance-visitors');
        }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-visitors', JSON.stringify(visitors));
    }
  }, [visitors, isClient]);

  const handleAddVisitor = (data: VisitorFormData) => {
    const personId = `person_${data.cpf || data.rg}`; // Use CPF or RG to identify a person
    const newVisitor: VisitorFormData = {
      ...data,
      id: `visit_${new Date().getTime()}`,
      personId: personId,
      createdAt: new Date().toISOString(),
      entryTime: new Date().toISOString(),
      status: 'inside',
    };
    setVisitors(prev => [newVisitor, ...prev]);
    toast({
      title: "Visitante Cadastrado e Entrada Registrada!",
      description: `${data.nome} foi adicionado(a) e sua entrada registrada.`,
    });
    form.reset();
  };
  
  const handleDeleteSelectedVisitors = () => {
    const personIdsToDelete = new Set(selectedVisitors);
    
    // Instead of filtering the main visitors array, we filter the derived `currentVisitors` list
    // to find the personIds to remove from the main list.
    const currentVisitorPersonIds = currentVisitors.map(v => v.personId);
    const personIdsToActuallyDelete = currentVisitorPersonIds.filter(id => personIdsToDelete.has(id!));

    setVisitors(prev => prev.filter(v => !personIdsToActuallyDelete.includes(v.personId!)));
    
    setSelectedVisitors([]);
    toast({
        title: "Visitantes Removidos",
        description: `Os ${personIdsToActuallyDelete.length} visitante(s) selecionado(s) foram removidos. O histórico foi mantido.`,
    });
  };

  const handleToggleVisitorSelection = (personId: string) => {
    setSelectedVisitors(prev => 
      prev.includes(personId) 
      ? prev.filter(id => id !== personId)
      : [...prev, personId]
    )
  };

  const handleToggleSelectAll = () => {
    if (selectedVisitors.length === currentVisitors.length) {
      setSelectedVisitors([]);
    } else {
      setSelectedVisitors(currentVisitors.map(v => v.personId!));
    }
  };

  const handleDeleteVisitor = (personId: string) => {
    setVisitors(prev => prev.filter(v => v.personId !== personId));
    setSelectedVisitors(prev => prev.filter(id => id !== personId));
    toast({
      title: "Visitante Removido",
      description: "O visitante foi removido da lista. Seu histórico foi mantido.",
    });
  };

  const handleReEntrySubmit = (data: ReEntryFormData) => {
    if (!reEntryVisitor) return;

    const newVisit: VisitorFormData = {
        ...reEntryVisitor, // Spread base data from the last visit
        ...data, // Spread new data from the form
        id: `visit_${new Date().getTime()}`,
        status: 'inside',
        entryTime: new Date().toISOString(),
        exitTime: undefined, // Clear exit time for the new visit
        createdAt: new Date().toISOString(),
    };
    setVisitors(prev => [newVisit, ...prev]);
    toast({
        title: "Nova Entrada Registrada!",
        description: `Uma nova entrada para ${reEntryVisitor.nome} foi registrada.`,
    });
    setReEntryVisitor(null); // Close the dialog
  };

  const handleVisitorExit = (visitorId: string) => {
    setVisitors(prev => prev.map(v => 
        v.id === visitorId 
        ? { ...v, status: 'exited', exitTime: new Date().toISOString() } 
        : v
    ));
     toast({
      title: "Saída Registrada!",
      description: `A saída do visitante foi registrada com sucesso.`,
    });
  };
  
  const handleVisitorClick = (visitor: VisitorFormData) => {
    if (visitor.status === 'inside') {
        handleVisitorExit(visitor.id!);
    } else if (visitor.status === 'exited') {
        setReEntryVisitor(visitor);
    }
  }

  const handleDeleteVisitorLog = (visitId: string) => {
    setVisitors(prev => prev.filter(v => v.id !== visitId));
    toast({
      title: "Registro de Histórico Removido",
      description: "A visita foi removida do histórico.",
    });
  };
  
  // This list will contain only the latest record for each person, to be shown in the "current" list.
  const currentVisitors = useMemo(() => {
    const latestVisitorRecord: Record<string, VisitorFormData> = {};

    // Sort visitors by time to process the most recent ones last
    const sorted = [...visitors].sort((a,b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

    for (const visitor of sorted) {
      // Use personId if it exists, otherwise fallback to id for older records
      const key = visitor.personId || visitor.id!;
      latestVisitorRecord[key] = visitor;
    }

    return Object.values(latestVisitorRecord);
  }, [visitors]);
  
  const numSelected = selectedVisitors.length;
  const numTotal = currentVisitors.length;

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
                  name="rg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RG</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 12.345.678-9" {...field} />
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
                        <Input placeholder="Ex: 123.456.789-00" {...field} />
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
                  name="placa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa do Veículo (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: BRA2E19" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="responsavel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsável pela Visita</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva (TI)" {...field} />
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
                 <FormField
                  control={form.control}
                  name="portaria"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Portaria</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex items-center space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="p1" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              P1
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="p2" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              P2
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
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
            <Tabs defaultValue="visitors">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="visitors">Visitantes</TabsTrigger>
                    <TabsTrigger value="history">Histórico</TabsTrigger>
                </TabsList>
                <TabsContent value="visitors">
                    <VisitorList 
                        visitors={currentVisitors} 
                        selectedVisitors={selectedVisitors}
                        numSelected={numSelected}
                        numTotal={numTotal}
                        onDelete={handleDeleteVisitor}
                        onVisitorClick={handleVisitorClick}
                        onToggleSelection={handleToggleVisitorSelection}
                        onToggleSelectAll={handleToggleSelectAll}
                        onDeleteSelected={handleDeleteSelectedVisitors}
                    />
                </TabsContent>
                 <TabsContent value="history">
                    <VisitorHistory
                        visitors={visitors}
                        onDelete={handleDeleteVisitorLog}
                    />
                </TabsContent>
            </Tabs>
        </div>
      </div>
      
      <ReEntryDialog 
        isOpen={!!reEntryVisitor}
        onClose={() => setReEntryVisitor(null)}
        visitor={reEntryVisitor}
        onSubmit={handleReEntrySubmit}
      />
    </main>
  );
}
