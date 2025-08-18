
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Users, Truck, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";


interface AppHeaderProps {
    title: string;
    description: string;
    activePage: 'employees' | 'visitors' | 'vehicles';
    children?: React.ReactNode;
}

export function AppHeader({ title, description, activePage, children }: AppHeaderProps) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: { outcome: string }) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        } else {
          console.log('User dismissed the install prompt');
        }
        setInstallPrompt(null);
      });
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold font-headline text-primary">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
        <div className="flex items-center gap-2">
            {installPrompt && (
                <Button onClick={handleInstallClick}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar App
                </Button>
            )}
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant={activePage === 'employees' ? "default" : "outline"} size="icon">
                            <Link href="/">
                                <Home className="h-5 w-5" />
                                <span className="sr-only">Página de Funcionários</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Funcionários</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant={activePage === 'visitors' ? "default" : "outline"} size="icon">
                             <Link href="/visitantes">
                                <Users className="h-5 w-5" />
                                <span className="sr-only">Página de Visitantes</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Visitantes</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
                 <Tooltip>
                    <TooltipTrigger asChild>
                        <Button asChild variant={activePage === 'vehicles' ? "default" : "outline"} size="icon">
                             <Link href="/veiculos">
                                <Truck className="h-5 w-5" />
                                <span className="sr-only">Página de Veículos</span>
                            </Link>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Veículos</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
