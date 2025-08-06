"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { QrCode } from 'lucide-react';
import Image from 'next/image';

const qrFormSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  setor: z.string().min(1, "O setor é obrigatório."),
  placa: z.string().optional(),
  ramal: z.string().optional(),
});

type QrFormData = z.infer<typeof qrFormSchema>;
type ScanDataType = QrFormData & { type: 'entry' | 'exit' };


export function QRGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [scanData, setScanData] = useState<ScanDataType | null>(null);

  const form = useForm<QrFormData>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: {
      nome: '',
      setor: '',
      placa: '',
      ramal: '',
    },
  });

  const generateQR = async (data: QrFormData, type: 'entry' | 'exit') => {
    try {
      const fullData: ScanDataType = { ...data, type };
      const url = await QRCode.toDataURL(JSON.stringify(fullData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#3F51B5',
          light: '#00000000',
        }
      });
      setQrCodeUrl(url);
      setScanData(fullData);
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = (data: QrFormData) => {
    // This function is for form validation, the actual QR generation is triggered by the buttons.
    // We can decide which type of QR code to show by default or have separate buttons.
  };

  const handleGenerate = (type: 'entry' | 'exit') => {
    form.handleSubmit((data) => generateQR(data, type))();
  };

  const translatedType = scanData?.type === 'entry' ? 'Entrada' : 'Saída';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            setQrCodeUrl('');
            setScanData(null);
            form.reset();
        }
    }}>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          Gerar QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Gerar QR Code de Ponto</DialogTitle>
          <DialogDescription>
            Preencha os dados para gerar um QR code de entrada ou saída.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="setor"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: TI, RH, Financeiro" {...field} />
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
                        <FormLabel>Placa (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: BRA2E19" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="ramal"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Ramal (Opcional)</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: 1234" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <div className="flex justify-around gap-4 pt-4">
                    <Button type="button" onClick={() => handleGenerate('entry')} className="flex-1">Gerar Entrada</Button>
                    <Button type="button" onClick={() => handleGenerate('exit')} variant="secondary" className="flex-1">Gerar Saída</Button>
                </div>
            </form>
        </Form>
        
        {qrCodeUrl && scanData && (
          <div className="mt-4 p-4 border-dashed border-2 border-primary rounded-lg flex flex-col items-center bg-primary/10">
            <p className="font-headline text-lg mb-2 capitalize">QR Code para {translatedType}</p>
            <Image src={qrCodeUrl} alt={`QR Code para ${scanData.nome}`} width={250} height={250} />
            <div className="text-center mt-2 text-sm text-primary/80">
                <p><strong>Nome:</strong> {scanData.nome}</p>
                <p><strong>Setor:</strong> {scanData.setor}</p>
                {scanData.placa && <p><strong>Placa:</strong> {scanData.placa}</p>}
                {scanData.ramal && <p><strong>Ramal:</strong> {scanData.ramal}</p>}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
