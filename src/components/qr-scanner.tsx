"use client";

import { useEffect, useState, useRef } from 'react';
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
    if (isScanning && !scannerRef.current?.getState()) {
      const onScanSuccess = (decodedText: string, decodedResult: Html5QrcodeResult) => {
        onScan(decodedText);
      };

      const onScanFailure = (errorMessage: string, errorObject: Html5QrcodeError) => {
        // This callback is called frequently, so we don't log to avoid console spam.
      };
      
      const config = { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [] };
      scannerRef.current = new Html5Qrcode(QR_SCANNER_ELEMENT_ID, false);
      
      scannerRef.current.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        onScanFailure
      ).catch(err => {
        console.error("Failed to start QR scanner.", err);
        setIsScanning(false);
      });

    } else if (!isScanning && scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
      scannerRef.current.stop().catch(err => {
        console.error("Failed to stop scanner.", err);
      });
    }

    return () => {
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        scannerRef.current.stop().catch(err => {
          console.error("Failed to stop scanner on cleanup.", err);
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
        <CardTitle className="text-2xl font-headline">QR Code Scanner</CardTitle>
        <Button onClick={toggleScan} variant="outline" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
            {isScanning ? <CameraOff /> : <Camera />}
            <span className="sr-only">{isScanning ? 'Stop Scanning' : 'Start Scanning'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div id={QR_SCANNER_ELEMENT_ID} className="w-full rounded-md [&>div]:rounded-md [&>video]:rounded-md [&>div>span]:hidden [&>div>button]:hidden" />
        {!isScanning && (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-[305px] -mt-[305px] border-2 border-dashed rounded-md bg-muted/50">
            <p>Click the camera icon to start scanning.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
