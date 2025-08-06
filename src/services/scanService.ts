"use client";

import type { AttendanceScan } from '@/types';

const SCANS_KEY = 'scans_storage';

const getStoredScans = (): AttendanceScan[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(SCANS_KEY);
    return stored ? JSON.parse(stored) : [];
};

const setStoredScans = (scans: AttendanceScan[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SCANS_KEY, JSON.stringify(scans));
};

export const addScan = async (scanData: Omit<AttendanceScan, 'scanId'>): Promise<string> => {
    const scans = getStoredScans();
    const newScan: AttendanceScan = {
        scanId: `scan_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
        ...scanData,
    };
    const updatedScans = [...scans, newScan];
    setStoredScans(updatedScans);
    return newScan.scanId;
};

export const getScans = async (): Promise<AttendanceScan[]> => {
    const scans = getStoredScans();
    return [...scans].sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
};

export const getLastScanForEmployee = async (employeeId: string): Promise<AttendanceScan | null> => {
    const scans = getStoredScans();
    const employeeScans = scans
        .filter(scan => scan.employeeId === employeeId)
        .sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
    return employeeScans[0] || null;
};

export const deleteScan = async (scanId: string): Promise<void> => {
    let scans = getStoredScans();
    scans = scans.filter(s => s.scanId !== scanId);
    setStoredScans(scans);
};
