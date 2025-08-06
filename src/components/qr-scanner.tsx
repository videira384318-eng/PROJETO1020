"use client";

import { useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeError, Html5QrcodeResult, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const QR_SCANNER_ELEMENT_ID = "qr-reader";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  isScanning: boolean;
  setIsScanning: (isScanning: boolean) => void;
}

export function QRScanner({ onScan, isScanning, setIsScanning }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
      onScan(decodedText);
    };

    const onScanFailure = (errorMessage: string, errorObject: Html5QrcodeError) => {
      // Este callback é chamado frequentemente, então não registramos para evitar spam no console.
    };

    const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };
    
    if (!scannerRef.current) {
        const scanner = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, false);
        scannerRef.current = scanner;
    }
    const html5QrCode = scannerRef.current;
    
    if (isScanning && html5QrCode.getState() !== Html5QrcodeScannerState.SCANNING) {
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      ).catch(err => {
        console.error("Falha ao iniciar o leitor de QR.", err);
        setIsScanning(false);
      });
    } else if (!isScanning && html5QrCode.getState() === Html5QrcodeScannerState.SCANNING) {
      html5QrCode.stop().catch(err => {
        console.error("Falha ao parar o leitor.", err);
      });
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => {
          console.error("Falha ao parar o leitor na limpeza.", err);
        });
      }
    };
  }, [isScanning, onScan, setIsScanning]);

  const toggleScan = () => {
    setIsScanning(!isScanning);
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
      </CardContent>
    </Card>
  );
}
