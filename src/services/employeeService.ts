"use client";

import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_COLLECTION = 'employees_local';

// Helper function to get employees from localStorage
const getStoredEmployees = (): QrFormData[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(EMPLOYEES_COLLECTION);
  return stored ? JSON.parse(stored) : [];
};

// Helper function to save employees to localStorage
const setStoredEmployees = (employees: QrFormData[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMPLOYEES_COLLECTION, JSON.stringify(employees));
};

export const addEmployee = (employeeData: Omit<QrFormData, 'id'>): string => {
  const employees = getStoredEmployees();
  const newEmployee: QrFormData = {
    ...employeeData,
    id: `emp_${new Date().getTime()}_${Math.random()}`
  };
  const updatedEmployees = [...employees, newEmployee];
  setStoredEmployees(updatedEmployees);
  return newEmployee.id!;
};

export const deleteEmployees = (employeeIds: string[]): void => {
    let employees = getStoredEmployees();
    const updatedEmployees = employees.filter(emp => !employeeIds.includes(emp.id!));
    setStoredEmployees(updatedEmployees);
};

export const clearEmployees = (): void => {
    setStoredEmployees([]);
}

export const getEmployees = (): QrFormData[] => {
    return getStoredEmployees();
};
