
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Visitor, VisitLog, VisitorWithStatus, NewVisitorFormData, RevisitFormData } from '@/types';
import { AppHeader } from '@/components/app-header';
import { Skeleton } from '@/components/ui/skeleton';
import { VisitorList } from '@/components/visitor-list';
import { VisitorEntryDialog } from '@/components/visitor-entry-dialog';
import { addVisitor, getVisitors, deleteVisitors, getVisitor, updateVisitor } from '@/services/visitorService';
import { addVisitLog, getVisits, updateVisitLog, getLastVisitForVisitor } from '@/services/visitLogService';
import { useToast } from "@/hooks/use-toast";
import { RevisitDialog } from '@/components/revisit-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisitLogHistory } from '@/components/visit-log-history';

export default function VisitantesPage() {
  const [visitors, setVisitors] = useState<VisitorWithStatus[]>([]);
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVisitors, setSelectedVisitors] = useState<string[]>([]);
  const [revisitingVisitor, setRevisitingVisitor] = useState<Visitor | null>(null);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [visitorsData, visitsData] = await Promise.all([
          getVisitors(),
          getVisits()
      ]);
      
      const visitorsWithStatus = await Promise.all(
          visitorsData.map(async (visitor) => {
              const lastVisit = await getLastVisitForVisitor(visitor.id);
              return {
                  ...visitor,
                  status: lastVisit?.status ?? 'exited',
                  lastVisitId: lastVisit?.id,
                  // Carry over last visit details for pre-filling revisit form
                  plate: lastVisit?.plate,
                  responsible: lastVisit?.responsible,
                  reason: lastVisit?.reason,
              };
          })
      );

      setVisitors(visitorsWithStatus.sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      setVisitLogs(visitsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os dados de visitantes ou de histórico.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddVisitor = async (formData: NewVisitorFormData) => {
    try {
      // 1. Create the permanent visitor record
      const visitorData: Omit<Visitor, 'id'> = {
        name: formData.name,
        company: formData.company,
        rg: formData.rg,
        cpf: formData.cpf,
      };
      const newVisitorId = await addVisitor(visitorData);

      // 2. Create the first visit log for this visitor
      const visitLogData = {
          visitorId: newVisitorId,
          visitorName: formData.name,
          visitorCompany: formData.company,
          plate: formData.plate,
          responsible: formData.responsible,
          reason: formData.reason,
          parkingLot: formData.parkingLot,
      };
      await addVisitLog(visitLogData);


      toast({
        title: "Visitante Cadastrado e Entrada Registrada!",
        description: `${formData.name} foi cadastrado(a) e sua entrada foi registrada.`,
        className: 'bg-green-600 text-white'
      });
      fetchData();
    } catch (error) {
      console.error("Error adding visitor and first visit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar visitante",
      });
    }
  };

  const handleRegisterVisit = async (formData: RevisitFormData) => {
    if (!revisitingVisitor) return;

    try {
        await addVisitLog({
            visitorId: revisitingVisitor.id,
            visitorName: revisitingVisitor.name,
            visitorCompany: revisitingVisitor.company,
            plate: formData.plate,
            responsible: formData.responsible,
            reason: formData.reason,
            parkingLot: formData.parkingLot,
        });

        toast({
            title: "Entrada Registrada!",
            description: `A nova visita de ${revisitingVisitor.name} foi registrada.`,
            className: 'bg-green-600 text-white'
        });
        setRevisitingVisitor(null);
        fetchData();

    } catch (error) {
        console.error("Error adding visit log:", error);
        toast({
            variant: "destructive",
            title: "Erro ao registrar visita",
        });
    }
  };

  const handleExitVisitor = async (visitorId: string) => {
     try {
        const visitor = visitors.find(v => v.id === visitorId);
        if (visitor && visitor.lastVisitId) {
            await updateVisitLog(visitor.lastVisitId, {
                status: 'exited',
                exitTimestamp: new Date().toISOString()
            });
            toast({
              title: "Saída Registrada!",
              description: `A saída de ${visitor.name} foi registrada.`,
              className: 'bg-red-600 text-white',
            });
            fetchData();
        } else {
             throw new Error("Última visita não encontrada para registrar a saída.");
        }
    } catch (error) {
       console.error("Error updating visitor exit:", error);
       toast({
        variant: "destructive",
        title: "Erro ao registrar saída",
      });
    }
  };

  const handleDeleteSelectedVisitors = async () => {
    try {
        await deleteVisitors(selectedVisitors);
        const count = selectedVisitors.length;
        setSelectedVisitors([]);
        toast({
            title: "Visitantes Removidos",
            description: `Os ${count} visitante(s) selecionado(s) e seus históricos foram removidos.`,
        });
        fetchData();
    } catch (error) {
        console.error("Error deleting visitors:", error);
        toast({
            variant: "destructive",
            title: "Erro ao remover visitantes",
        });
    }
  };

  const handleRevisitClick = async (visitorId: string) => {
      // We already have the visitor data with last visit info in the `visitors` state
      const visitorData = visitors.find(v => v.id === visitorId);
      if (visitorData) {
          setRevisitingVisitor(visitorData);
      } else {
          // Fallback if not found in state
          const visitorFromDB = await getVisitor(visitorId);
          if (visitorFromDB) {
              setRevisitingVisitor(visitorFromDB);
          }
      }
  }

  const handleToggleVisitorSelection = (visitorId: string) => {
    setSelectedVisitors(prev => 
      prev.includes(visitorId) 
      ? prev.filter(id => id !== visitorId)
      : [...prev, visitorId]
    );
  };
  
  const handleToggleSelectAll = (filteredVisitors: Visitor[]) => {
    if (selectedVisitors.length === filteredVisitors.length) {
      setSelectedVisitors([]);
    } else {
      setSelectedVisitors(filteredVisitors.map(v => v.id));
    }
  };

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Skeleton className="h-10 w-72 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </main>
    );
  }

  return (
    <>
    <main className="container mx-auto p-4 md:p-8">
      <AppHeader
        title="Controle de Visitantes"
        description="Gerencie o cadastro e o fluxo de visitantes."
      >
        <VisitorEntryDialog onSubmit={handleAddVisitor}/>
      </AppHeader>

       <Tabs defaultValue="visitors" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visitors">Visitantes</TabsTrigger>
                <TabsTrigger value="history">Histórico de Visitas</TabsTrigger>
            </TabsList>
            <TabsContent value="visitors">
                <VisitorList
                    visitors={visitors}
                    onRevisit={handleRevisitClick}
                    onExit={handleExitVisitor}
                    selectedVisitors={selectedVisitors}
                    onToggleSelection={handleToggleVisitorSelection}
                    onToggleSelectAll={handleToggleSelectAll}
                    onDeleteSelected={handleDeleteSelectedVisitors}
                />
            </TabsContent>
            <TabsContent value="history">
                <VisitLogHistory visits={visitLogs} />
            </TabsContent>
        </Tabs>
    </main>

    <RevisitDialog
        isOpen={!!revisitingVisitor}
        onClose={() => setRevisitingVisitor(null)}
        visitor={revisitingVisitor}
        onSubmit={handleRegisterVisit}
    />
    </>
  );
}
