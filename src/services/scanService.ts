
"use client";

import type { AttendanceScan } from '@/types';

const SCANS_KEY = 'scans';

// --- Local Storage Helpers ---
const getFromStorage = <T>(key: string): T[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
};

const setInStorage = <T>(key: string, data: T[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
};

// --- Scan Management ---
export const addScan = (scanData: Omit<AttendanceScan, 'scanId' | 'id'>): string => {
    const scans = getFromStorage<AttendanceScan>(SCANS_KEY);
    const newId = `scan_${new Date().getTime()}_${Math.random()}`;
    const newScan = { id: newId, scanId: newId, ...scanData };
    const updatedScans = [...scans, newScan];
    setInStorage(SCANS_KEY, updatedScans);
    return newId;
};

export const getScans = (): AttendanceScan[] => {
    return getFromStorage<AttendanceScan>(SCANS_KEY);
};

export const getLastScanForEmployee = (employeeId: string): AttendanceScan | null => {
    const scans = getFromStorage<AttendanceScan>(SCANS_KEY);
    const employeeScans = scans
        .filter(scan => scan.employeeId === employeeId)
        .sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
    return employeeScans.length > 0 ? employeeScans[0] : null;
};

export const deleteScan = (scanId: string): void => {
    let scans = getFromStorage<AttendanceScan>(SCANS_KEY);
    scans = scans.filter(s => s.scanId !== scanId);
    setInStorage(SCANS_KEY, scans);
};

// This function is kept for compatibility but might not be used in a pure localStorage implementation
export const deleteScansForEmployee = (employeeId: string): void => {
    let scans = getFromStorage<AttendanceScan>(SCANS_KEY);
    scans = scans.filter(scan => scan.employeeId !== employeeId);
    setInStorage(SCANS_KEY, scans);
};
