"use client";

import { useState } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode } from 'lucide-react';
import Image from 'next/image';

type ScanType = 'entry' | 'exit';

function translateScanType(scanType: ScanType | null) {
    if (!scanType) return '';
    return scanType === 'entry' ? 'Entrada' : 'Saída';
}

export function QRGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [scanType, setScanType] = useState<ScanType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generateQR = async (type: ScanType) => {
    try {
      const data = JSON.stringify({ type });
      const url = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#3F51B5',
          light: '#00000000',
        }
      });
      setQrCodeUrl(url);
      setScanType(type);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          Gerar QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Gerar QR Code de Ponto</DialogTitle>
          <DialogDescription>
            Gere um QR code para os funcionários escanearem na entrada ou saída.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-around gap-4">
            <Button onClick={() => generateQR('entry')} className="flex-1">Entrada</Button>
            <Button onClick={() => generateQR('exit')} variant="secondary" className="flex-1">Saída</Button>
          </div>
          {qrCodeUrl && (
            <div className="mt-4 p-4 border-dashed border-2 border-primary rounded-lg flex flex-col items-center bg-primary/10">
              <p className="font-headline text-lg mb-2 capitalize">Escanear para {translateScanType(scanType)}</p>
              <Image src={qrCodeUrl} alt={`QR Code para ${scanType}`} width={250} height={250} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
