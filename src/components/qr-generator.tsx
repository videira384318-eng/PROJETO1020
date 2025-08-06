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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { QrCode, Printer } from 'lucide-react';
import Image from 'next/image';

const qrFormSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  setor: z.string().min(1, "O setor é obrigatório."),
  placa: z.string().optional(),
  ramal: z.string().optional(),
});

type QrFormData = z.infer<typeof qrFormSchema>;

export function QRGenerator() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [qrData, setQrData] = useState<QrFormData | null>(null);

  const form = useForm<QrFormData>({
    resolver: zodResolver(qrFormSchema),
    defaultValues: {
      nome: '',
      setor: '',
      placa: '',
      ramal: '',
    },
  });

  const generateQR = async (data: QrFormData) => {
    try {
      const url = await QRCode.toDataURL(JSON.stringify(data), {
        width: 300,
        margin: 2,
        color: {
          dark: '#3F51B5',
          light: '#FFFFFF',
        }
      });
      setQrCodeUrl(url);
      setQrData(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(`
        <html>
            <head>
            <title>Imprimir QR Code</title>
            <style>
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                }
                body { 
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    justify-content: center; 
                    height: 100vh; 
                    margin: 0; 
                    font-family: Arial, sans-serif;
                }
                .print-container {
                    text-align: center;
                    border: 2px solid #ccc;
                    padding: 20px;
                    border-radius: 10px;
                }
                img {
                    max-width: 80%;
                }
                h2, p {
                    margin: 5px 0;
                }
            </style>
            </head>
            <body>
                <div class="print-container">
                    <h2>QR Code de Ponto</h2>
                    <img src="${qrCodeUrl}" alt="QR Code" />
                    ${qrData ? `
                        <p><strong>Nome:</strong> ${qrData.nome}</p>
                        <p><strong>Setor:</strong> ${qrData.setor}</p>
                        ${qrData.placa ? `<p><strong>Placa:</strong> ${qrData.placa}</p>` : ''}
                        ${qrData.ramal ? `<p><strong>Ramal:</strong> ${qrData.ramal}</p>` : ''}
                    ` : ''}
                </div>
            </body>
        </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
            setQrCodeUrl('');
            setQrData(null);
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
            Preencha os dados do funcionário para gerar um QR code.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(generateQR)} className="space-y-4">
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
                <DialogFooter className="pt-4">
                     <Button type="submit" className="flex-1">Gerar QR Code</Button>
                </DialogFooter>
            </form>
        </Form>
        
        {qrCodeUrl && qrData && (
          <div className="mt-4 p-4 border-dashed border-2 border-primary rounded-lg flex flex-col items-center bg-primary/10">
            <p className="font-headline text-lg mb-2 capitalize">QR Code para Funcionário</p>
            <Image src={qrCodeUrl} alt={`QR Code para ${qrData.nome}`} width={250} height={250} />
            <div className="text-center mt-2 text-sm text-primary/80">
                <p><strong>Nome:</strong> {qrData.nome}</p>
                <p><strong>Setor:</strong> {qrData.setor}</p>
                {qrData.placa && <p><strong>Placa:</strong> {qrData.placa}</p>}
                {qrData.ramal && <p><strong>Ramal:</strong> {qrData.ramal}</p>}
            </div>
             <Button onClick={handlePrint} variant="secondary" className="mt-4 w-full">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir QR Code
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
