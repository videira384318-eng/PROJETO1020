"use client";

import { useState, useEffect } from 'react';
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';
import { QRScanner } from '@/components/qr-scanner';
import { AttendanceLog } from '@/components/attendance-log';
import { QRGenerator } from '@/components/qr-generator';
import { AnomalyDetector } from '@/components/anomaly-detector';
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
      console.error("Failed to parse scans from localStorage", error);
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
      if (type !== 'entry' && type !== 'exit') {
        throw new Error('Invalid scan type');
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
        title: "Scan Successful!",
        description: `Recorded ${type} for ${newScan.employeeId}.`,
      });

    } catch (error) {
      console.error("Failed to process scan:", error);
      toast({
        variant: "destructive",
        title: "Invalid QR Code",
        description: "Please scan a valid attendance QR code.",
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
          <h1 className="text-4xl font-bold font-headline text-primary">QR Attendance</h1>
          <p className="text-muted-foreground">Scan QR codes to record employee attendance.</p>
        </div>
        <div className="flex gap-2">
            <QRGenerator />
            <Button variant="outline" onClick={clearLogs} disabled={scans.length === 0}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Logs
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <QRScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />
          <AttendanceLog scans={scans} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-8">
            <AnomalyDetector scans={scans} />
          </div>
        </div>
      </div>
    </main>
  );
}
