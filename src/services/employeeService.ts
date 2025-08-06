"use client";

import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_KEY = 'employees_storage';

const getStoredEmployees = (): QrFormData[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(EMPLOYEES_KEY);
    return stored ? JSON.parse(stored) : [];
};

const setStoredEmployees = (employees: QrFormData[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
};

export const addEmployee = async (employeeData: Omit<QrFormData, 'id'>): Promise<string> => {
    const employees = getStoredEmployees();
    const newEmployee: QrFormData = {
        id: `emp_${new Date().getTime()}_${Math.random().toString(36).substring(2, 9)}`,
        ...employeeData,
    };
    const updatedEmployees = [...employees, newEmployee];
    setStoredEmployees(updatedEmployees);
    return newEmployee.id!;
};

export const getEmployees = async (): Promise<QrFormData[]> => {
    return getStoredEmployees();
};

export const deleteEmployees = async (employeeIds: string[]): Promise<void> => {
    if (employeeIds.length === 0) return;
    let employees = getStoredEmployees();
    employees = employees.filter(emp => !employeeIds.includes(emp.id!));
    setStoredEmployees(employees);
};

export const clearEmployees = async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(EMPLOYEES_KEY);
};
