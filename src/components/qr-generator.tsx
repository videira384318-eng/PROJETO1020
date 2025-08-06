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
          Generate QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Generate Attendance QR Code</DialogTitle>
          <DialogDescription>
            Generate a QR code for employees to scan for entry or exit.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-around gap-4">
            <Button onClick={() => generateQR('entry')} className="flex-1">Entry</Button>
            <Button onClick={() => generateQR('exit')} variant="secondary" className="flex-1">Exit</Button>
          </div>
          {qrCodeUrl && (
            <div className="mt-4 p-4 border-dashed border-2 border-primary rounded-lg flex flex-col items-center bg-primary/10">
              <p className="font-headline text-lg mb-2 capitalize">Scan for {scanType}</p>
              <Image src={qrCodeUrl} alt={`QR Code for ${scanType}`} width={250} height={250} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
