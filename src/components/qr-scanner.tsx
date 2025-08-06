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
}

export function QRScanner({ onScan }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !scannerRef.current) {
        scannerRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, false);
    }
    
    // Cleanup function
    return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(err => console.error("Falha ao parar o leitor no cleanup.", err));
        }
    };
  }, []);

  const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
    onScan(decodedText);
    stopScanner(); // Stop after successful scan
  };

  const onScanFailure = (errorMessage: string, errorObject: Html5QrcodeError) => {
    // This callback is called frequently, so we don't log to avoid console spam.
  };

  const startScanner = async () => {
    const html5QrCode = scannerRef.current;
    if (!html5QrCode) return;
    
    // Check for camera permissions before starting
    try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
            setHasPermission(true);
        } else {
            setHasPermission(false);
            throw new Error("Nenhuma câmera encontrada.");
        }
    } catch(err) {
        setHasPermission(false);
        setIsScanning(false);
        toast({
            variant: "destructive",
            title: "Acesso à Câmera Negado",
            description: "Por favor, habilite a permissão da câmera nas configurações do seu navegador.",
        })
        return;
    }
    
    if (html5QrCode.getState() !== Html5QrcodeScannerState.SCANNING) {
      setIsScanning(true);
      try {
        const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanFailure
        );
      } catch (err) {
        console.error("Falha ao iniciar o leitor de QR.", err);
        setHasPermission(false);
        setIsScanning(false);
        toast({
            variant: "destructive",
            title: "Erro ao Iniciar Câmera",
            description: "Não foi possível iniciar a câmera. Tente novamente.",
        })
      }
    }
  };

  const stopScanner = async () => {
      const html5QrCode = scannerRef.current;
      if (html5QrCode && html5QrCode.isScanning) {
          try {
              await html5QrCode.stop();
          } catch(err) {
              // Stop may fail if the scanner is not in a stopped state. This is okay.
              console.log("Tentativa de parar leitor que já estava parado.", err);
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
         {!isScanning && hasPermission !== false && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-muted-foreground bg-muted/20">
            <Camera className="h-10 w-10 mb-2" />
            <p>Clique no botão da câmera para começar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
