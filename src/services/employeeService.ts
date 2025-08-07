
"use client";

import type { QrFormData } from '@/components/qr-generator';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { deleteScansForEmployee } from './scanService';


const EMPLOYEES_COLLECTION = 'employees';

export const addEmployee = async (employeeData: Omit<QrFormData, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employeeData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding employee to Firestore: ", error);
        throw new Error("Failed to add employee.");
    }
};

export const getEmployees = async (): Promise<QrFormData[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
        const employees: QrFormData[] = [];
        querySnapshot.forEach((doc) => {
            employees.push({ id: doc.id, ...doc.data() } as QrFormData);
        });
        return employees;
    } catch (error) {
        console.error("Error getting employees from Firestore: ", error);
        throw new Error("Failed to get employees.");
    }
};

export const deleteEmployees = async (employeeIds: string[]): Promise<void> => {
    if (employeeIds.length === 0) return;
    try {
        const batch = writeBatch(db);
        for (const id of employeeIds) {
            // First, delete all scans associated with each employee
            await deleteScansForEmployee(id);
            // Then, add the employee deletion to the batch
            const docRef = doc(db, EMPLOYEES_COLLECTION, id);
            batch.delete(docRef);
        }
        await batch.commit();
    } catch (error) {
        console.error("Error deleting employees from Firestore: ", error);
        throw new Error("Failed to delete employees.");
    }
};


export const clearEmployees = async (): Promise<void> => {
     try {
        const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
        const batch = writeBatch(db);
        querySnapshot.forEach(async (docSnapshot) => {
            // For each employee, delete their scans, then the employee doc
            await deleteScansForEmployee(docSnapshot.id);
            batch.delete(docSnapshot.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error clearing employees from Firestore: ", error);
        throw new Error("Failed to clear employees.");
    }
};
