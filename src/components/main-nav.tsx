
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Car, User } from "lucide-react";

const navLinks = [
  { href: "/", label: "Ponto", icon: Home },
  { href: "/veiculos", label: "Veículos", icon: Car },
  { href: "/visitantes", label: "Visitantes", icon: User },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-card border-b">
        <div className="container mx-auto flex items-center justify-center px-4">
            <div className="flex items-center space-x-2 p-2">
                {navLinks.map((link) => (
                <Button
                    key={link.href}
                    asChild
                    variant={pathname === link.href ? "secondary" : "ghost"}
                    className="justify-start"
                >
                    <Link href={link.href} className="flex items-center gap-2">
                    <link.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{link.label}</span>
                    </Link>
                </Button>
                ))}
            </div>
        </div>
    </nav>
  );
}
