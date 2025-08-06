"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { checkForAnomalies } from '@/lib/actions';
import type { AttendanceScan, AttendanceAnomalyDetectionOutput } from '@/ai/flows/attendance-anomaly-detection';

interface AnomalyDetectorProps {
  scans: AttendanceScan[];
}

export function AnomalyDetector({ scans }: AnomalyDetectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AttendanceAnomalyDetectionOutput | null>(null);

  const handleCheck = async () => {
    setIsLoading(true);
    setResult(null);
    const res = await checkForAnomalies(scans);
    setResult(res);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Anomaly Detection</CardTitle>
        <CardDescription>Use AI to analyze scan patterns and flag suspicious activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleCheck} disabled={isLoading || scans.length < 2} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Terminal className="mr-2 h-4 w-4" />}
          {isLoading ? 'Analyzing...' : 'Check for Anomalies'}
        </Button>
        {scans.length < 2 && (
            <p className="text-sm text-center text-muted-foreground">
                At least two scans are needed for anomaly detection.
            </p>
        )}
        {result && (
          <Alert variant={result.anomalyDetected ? "destructive" : "default"} className={!result.anomalyDetected ? "bg-primary/10 border-primary/50" : ""}>
            {result.anomalyDetected ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            <AlertTitle className="font-headline">{result.anomalyDetected ? "Anomaly Detected!" : "No Anomalies Found"}</AlertTitle>
            <AlertDescription>
              {result.anomalyDescription}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
