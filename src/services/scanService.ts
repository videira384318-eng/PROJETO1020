
"use client";

import type { AttendanceScan } from '@/types';

const SCANS_KEY = 'scans';

const getStoredScans = (): AttendanceScan[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SCANS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const setStoredScans = (scans: AttendanceScan[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SCANS_KEY, JSON.stringify(scans));
};


export const addScan = (scanData: Omit<AttendanceScan, 'scanId'>): string => {
    const scans = getStoredScans();
    const newId = `scan_${new Date().getTime()}_${Math.random()}`;
    const newScan = { scanId: newId, ...scanData };
    const updatedScans = [...scans, newScan];
    setStoredScans(updatedScans);
    return newId;
};

export const getScans = (): AttendanceScan[] => {
    const scans = getStoredScans();
    return scans.sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
};

export const getLastScanForEmployee = (employeeId: string): AttendanceScan | null => {
    const scans = getStoredScans();
    const employeeScans = scans
        .filter(scan => scan.employeeId === employeeId)
        .sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
    
    return employeeScans.length > 0 ? employeeScans[0] : null;
};

export const deleteScan = (scanId: string): void => {
    let scans = getStoredScans();
    scans = scans.filter(scan => scan.scanId !== scanId);
    setStoredScans(scans);
};
