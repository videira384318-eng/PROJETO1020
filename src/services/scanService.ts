"use client";

import type { AttendanceScan } from '@/types';

const SCANS_COLLECTION = 'scans_local';

// Helper function to get scans from localStorage
const getStoredScans = (): AttendanceScan[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SCANS_COLLECTION);
    return stored ? JSON.parse(stored) : [];
};

// Helper function to save scans to localStorage
const setStoredScans = (scans: AttendanceScan[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SCANS_COLLECTION, JSON.stringify(scans));
};

export const addScan = (scanData: Omit<AttendanceScan, 'scanId'>): string => {
  const scans = getStoredScans();
  const newScan: AttendanceScan = {
    ...scanData,
    scanId: `scan_${new Date().getTime()}_${Math.random()}`
  };
  const updatedScans = [newScan, ...scans]; // Add to the beginning for chronological order
  setStoredScans(updatedScans);
  return newScan.scanId;
};

export const deleteScan = (scanId: string): void => {
    const scans = getStoredScans();
    const updatedScans = scans.filter(scan => scan.scanId !== scanId);
    setStoredScans(updatedScans);
};

export const getScans = (): AttendanceScan[] => {
    const scans = getStoredScans();
    // Sort by time descending
    return scans.sort((a,b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
};
