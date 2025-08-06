"use client";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch, query, where } from 'firebase/firestore';
import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_COLLECTION = 'employees';

export const addEmployee = async (employeeData: Omit<QrFormData, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employeeData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding employee to Firestore: ", error);
        throw new Error("Could not add employee.");
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
        throw new Error("Could not get employees.");
    }
};

export const deleteEmployees = async (employeeIds: string[]): Promise<void> => {
    if (employeeIds.length === 0) return;
    try {
        const batch = writeBatch(db);
        employeeIds.forEach((id) => {
            const docRef = doc(db, EMPLOYEES_COLLECTION, id);
            batch.delete(docRef);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error deleting employees from Firestore: ", error);
        throw new Error("Could not delete employees.");
    }
};

export const clearEmployees = async (): Promise<void> => {
    try {
        const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION));
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error clearing employees from Firestore: ", error);
        throw new Error("Could not clear employees.");
    }
};
