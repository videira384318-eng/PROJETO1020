
"use client";

import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_KEY = 'employees';

const getStoredEmployees = (): QrFormData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    return stored ? JSON.parse(stored) : [];
};

const setStoredEmployees = (employees: QrFormData[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const addEmployee = (employeeData: Omit<QrFormData, 'id'>): string => {
    const employees = getStoredEmployees();
    const newId = `emp_${new Date().getTime()}_${Math.random()}`;
    const newEmployee = { id: newId, ...employeeData };
    const updatedEmployees = [...employees, newEmployee];
    setStoredEmployees(updatedEmployees);
    return newId;
};

export const getEmployees = (): QrFormData[] => {
    return getStoredEmployees();
};

export const deleteEmployees = (employeeIds: string[]): void => {
    if (employeeIds.length === 0) return;
    let employees = getStoredEmployees();
    employees = employees.filter(emp => !employeeIds.includes(emp.id!));
    setStoredEmployees(employees);
};

export const clearEmployees = (): void => {
    setStoredEmployees([]);
    // Also clear related scans
    if (typeof window !== 'undefined') {
        localStorage.removeItem('scans');
    }
};
