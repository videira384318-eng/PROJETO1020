"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Home, Users, Truck, UserCog } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth, type Role } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppHeaderProps {
    title: string;
    description: string;
    activePage: 'employees' | 'visitors' | 'vehicles';
    children?: React.ReactNode;
}

export function AppHeader({ title, description, activePage, children }: AppHeaderProps) {
  const { role, setRole } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-4xl font-bold font-headline text-primary">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col items-start md:items-end gap-2">
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
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <UserCog className="h-5 w-5" />
                        <span className="sr-only">Selecionar Perfil</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Selecionar Perfil</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={role} onValueChange={(value) => setRole(value as Role)}>
                        <DropdownMenuRadioItem value="adm">Administrador</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="rh">RH</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="portaria">Portaria</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
        </div>
        {children}
      </div>
    </div>
  );
}
