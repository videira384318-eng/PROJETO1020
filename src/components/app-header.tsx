"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AppHeaderProps {
    title: string;
    description: string;
    activePage: 'employees' | 'visitors';
    children?: React.ReactNode;
}

export function AppHeader({ title, description, activePage, children }: AppHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold font-headline text-primary">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
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
        {children}
        <ThemeToggle />
      </div>
    </div>
  );
}
