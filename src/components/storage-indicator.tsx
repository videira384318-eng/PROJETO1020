"use client";

import { HardDrive } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface StorageIndicatorProps {
  used: number;
  total: number;
  percentage: number;
}

export function StorageIndicator({ used, total, percentage }: StorageIndicatorProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-muted-foreground" />
          <span>Armazenamento Local</span>
        </CardTitle>
        <CardDescription>Uso do armazenamento do navegador</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
            <Progress value={percentage} className="h-2 flex-1" />
            <div className="text-sm font-mono text-muted-foreground whitespace-nowrap">
                {used}MB / {total}MB
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
