
"use client";

import type { QrFormData } from '@/components/qr-generator';
import type { AttendanceScan } from '@/types';

const EMPLOYEES_KEY = 'employees';
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


// --- Employee Management ---
export const addEmployee = (employeeData: Omit<QrFormData, 'id'>): string => {
    const employees = getFromStorage<QrFormData>(EMPLOYEES_KEY);
    const newId = `emp_${new Date().getTime()}_${Math.random()}`;
    const newEmployee = { id: newId, ...employeeData };
    const updatedEmployees = [...employees, newEmployee];
    setInStorage(EMPLOYEES_KEY, updatedEmployees);
    return newId;
};

export const getEmployees = (): QrFormData[] => {
    return getFromStorage<QrFormData>(EMPLOYEES_KEY);
};

export const deleteEmployees = (employeeIds: string[]): void => {
    if (employeeIds.length === 0) return;
    let employees = getFromStorage<QrFormData>(EMPLOYEES_KEY);
    let scans = getFromStorage<AttendanceScan>(SCANS_KEY);
    
    employees = employees.filter(emp => !employeeIds.includes(emp.id!));
    scans = scans.filter(scan => !employeeIds.includes(scan.employeeId));

    setInStorage(EMPLOYEES_KEY, employees);
    setInStorage(SCANS_KEY, scans);
};

export const clearEmployees = (): void => {
     setInStorage(EMPLOYEES_KEY, []);
     setInStorage(SCANS_KEY, []);
};
