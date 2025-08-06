'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting anomalies in attendance scan patterns.
 *
 * The flow uses an LLM to analyze a log of attendance scans and identify any unusual patterns,
 * such as multiple entries without exits or scans outside of expected hours.
 *
 * @fileOverview
 * - `detectAttendanceAnomaly`: The main function to detect attendance anomalies.
 * - `AttendanceScan`: The input type for the detectAttendanceAnomaly function, representing a single attendance scan.
 * - `AttendanceAnomalyDetectionOutput`: The output type for the detectAttendanceAnomaly function,
 *   indicating whether an anomaly was detected and providing a description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AttendanceScanSchema = z.object({
  scanId: z.string().describe('Unique identifier for the scan event.'),
  employeeId: z.string().describe('Identifier for the employee.'),
  scanTime: z.string().describe('Timestamp of the scan event (ISO format).'),
  scanType: z.enum(['entry', 'exit']).describe('Type of scan event (entry or exit).'),
  placa: z.string().optional().describe('License plate of the employee\'s vehicle.'),
  ramal: z.string().optional().describe('Employee\'s extension number.'),
});

export type AttendanceScan = z.infer<typeof AttendanceScanSchema>;

const AttendanceAnomalyDetectionOutputSchema = z.object({
  anomalyDetected: z.boolean().describe('Indicates whether an anomaly was detected.'),
  anomalyDescription: z
    .string()
    .describe('Description of the anomaly, if any.'),
});

export type AttendanceAnomalyDetectionOutput = z.infer<
  typeof AttendanceAnomalyDetectionOutputSchema
>;

export async function detectAttendanceAnomaly(
  attendanceScans: AttendanceScan[]
): Promise<AttendanceAnomalyDetectionOutput> {
  return attendanceAnomalyDetectionFlow(attendanceScans);
}

const attendanceAnomalyDetectionPrompt = ai.definePrompt({
  name: 'attendanceAnomalyDetectionPrompt',
  input: {schema: z.array(AttendanceScanSchema)},
  output: {schema: AttendanceAnomalyDetectionOutputSchema},
  prompt: `You are an AI assistant specialized in detecting anomalies in attendance logs.
  Analyze the following attendance scan data and determine if there are any unusual patterns,
  such as multiple entries without exits, scans outside of expected hours, or other suspicious activities.

  Scans:
  {{#each this}}
  - Scan ID: {{scanId}}, Employee ID: {{employeeId}}, Time: {{scanTime}}, Type: {{scanType}}, Placa: {{placa}}, Ramal: {{ramal}}
  {{/each}}

  Based on your analysis, determine if an anomaly is detected and provide a description.
  If no anomalies are detected, indicate that no anomaly was found.
  Return your answer as a valid JSON of the following format:
  {
    "anomalyDetected": boolean,
    "anomalyDescription": string
  }`,
});

const attendanceAnomalyDetectionFlow = ai.defineFlow(
  {
    name: 'attendanceAnomalyDetectionFlow',
    inputSchema: z.array(AttendanceScanSchema),
    outputSchema: AttendanceAnomalyDetectionOutputSchema,
  },
  async attendanceScans => {
    const {output} = await attendanceAnomalyDetectionPrompt(attendanceScans);
    return output!;
  }
);
