"use client";

import { useState, useEffect } from 'react';
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';
import { QRScanner } from '@/components/qr-scanner';
import { AttendanceLog } from '@/components/attendance-log';
import { QRGenerator } from '@/components/qr-generator';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const FAKE_EMPLOYEE_IDS = ['EMP001', 'EMP007', 'EMP042', 'EMP113', 'EMP121'];

export default function Home() {
  const [scans, setScans] = useState<AttendanceScan[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    try {
      const storedScans = localStorage.getItem('qr-attendance-scans');
      if (storedScans) {
        setScans(JSON.parse(storedScans));
      }
    } catch (error) {
      console.error("Falha ao analisar os registros do localStorage", error);
      localStorage.removeItem('qr-attendance-scans');
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem('qr-attendance-scans', JSON.stringify(scans));
    }
  }, [scans, isClient]);

  const handleScan = (decodedText: string) => {
    try {
      const { type } = JSON.parse(decodedText);
      const translatedType = type === 'entry' ? 'entrada' : 'saída';
      if (type !== 'entry' && type !== 'exit') {
        throw new Error('Tipo de escaneamento inválido');
      }

      const newScan: AttendanceScan = {
        scanId: `scan_${new Date().getTime()}_${Math.random().toString(36).substring(7)}`,
        employeeId: FAKE_EMPLOYEE_IDS[Math.floor(Math.random() * FAKE_EMPLOYEE_IDS.length)],
        scanTime: new Date().toISOString(),
        scanType: type,
      };

      setScans(prevScans => [newScan, ...prevScans]);
      setIsScanning(false);
      toast({
        title: "Escaneamento Concluído!",
        description: `Registrada ${translatedType} para ${newScan.employeeId}.`,
      });

    } catch (error) {
      console.error("Falha ao processar o escaneamento:", error);
      toast({
        variant: "destructive",
        title: "QR Code Inválido",
        description: "Por favor, escaneie um QR code de controle de ponto válido.",
      });
    }
  };

  const clearLogs = () => {
    setScans([]);
    localStorage.removeItem('qr-attendance-scans');
  }

  if (!isClient) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-headline text-primary">Controle de Ponto QR</h1>
          <p className="text-muted-foreground">Escaneie os QR codes para registrar a presença dos funcionários.</p>
        </div>
        <div className="flex gap-2">
            <QRGenerator />
            <Button variant="outline" onClick={clearLogs} disabled={scans.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar Registros
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
            <QRScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />
        </div>
        <div className="space-y-8">
             <AttendanceLog scans={scans} />
        </div>
      </div>
    </main>
  );
}
