'use server';

import { detectAttendanceAnomaly } from '@/ai/flows/attendance-anomaly-detection';
import type { AttendanceScan } from '@/ai/flows/attendance-anomaly-detection';

export async function checkForAnomalies(scans: AttendanceScan[]) {
  try {
    const result = await detectAttendanceAnomaly(scans);
    return result;
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    return { anomalyDetected: true, anomalyDescription: 'An error occurred while checking for anomalies. Please try again.' };
  }
}
