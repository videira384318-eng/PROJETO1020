"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, type Html5QrcodeError, type Html5QrcodeResult, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const QR_SCANNER_ELEMENT_ID = "qr-reader";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
}

export function QRScanner({ onScan, isScanning, setIsScanning }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        scannerRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, false);
    }
  }, []);

  const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
    onScan(decodedText);
  };

  const onScanFailure = (errorMessage: string, errorObject: Html5QrcodeError) => {
    // This callback is called frequently, so we don't log to avoid console spam.
  };

  const startScanner = async () => {
    const html5QrCode = scannerRef.current;
    if (!html5QrCode) return;
    
    if (html5QrCode.getState() !== Html5QrcodeScannerState.SCANNING) {
      try {
        const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
        setHasPermission(true);
        setIsScanning(true);
      } catch (err) {
        console.error("Falha ao iniciar o leitor de QR.", err);
        setHasPermission(false);
        setIsScanning(false);
        toast({
            variant: "destructive",
            title: "Acesso à Câmera Negado",
            description: "Por favor, habilite a permissão da câmera nas configurações do seu navegador.",
        })
      }
    }
  };

  const stopScanner = async () => {
      const html5QrCode = scannerRef.current;
      if (html5QrCode && html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
          try {
              await html5QrCode.stop();
          } catch(err) {
              console.error("Falha ao parar o leitor.", err);
          }
      }
      setIsScanning(false);
  }

  const toggleScan = () => {
    if (isScanning) {
        stopScanner();
    } else {
        startScanner();
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
        stopScanner();
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-2xl font-headline">Leitor de QR Code</CardTitle>
        <Button onClick={toggleScan} variant="outline" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
            {isScanning ? <CameraOff /> : <Camera />}
            <span className="sr-only">{isScanning ? 'Parar Leitura' : 'Iniciar Leitura'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div id={QR_SCANNER_ELEMENT_ID} className="w-full rounded-md [&>div]:rounded-md [&>video]:rounded-md [&>div>span]:hidden [&>div>button]:hidden"></div>
        {hasPermission === false && !isScanning && (
             <Alert variant="destructive">
              <CameraOff className="h-4 w-4" />
              <AlertTitle>Acesso à Câmera Necessário</AlertTitle>
              <AlertDescription>
                Permita o acesso à câmera para usar esta funcionalidade.
              </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
