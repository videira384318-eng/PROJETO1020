
"use client";

import type { QrFormData } from '@/components/qr-generator';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';

const EMPLOYEES_COLLECTION = 'employees';

export const addEmployee = async (employeeData: Omit<QrFormData, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employeeData);
    return docRef.id;
};

export const getEmployees = async (): Promise<QrFormData[]> => {
    const q = query(collection(db, EMPLOYEES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const employees: QrFormData[] = [];
    querySnapshot.forEach((doc) => {
        employees.push({ id: doc.id, ...doc.data() } as QrFormData);
    });
    return employees;
};

export const deleteEmployees = async (employeeIds: string[]): Promise<void> => {
    if (employeeIds.length === 0) return;
    const batch = writeBatch(db);
    employeeIds.forEach(id => {
        const docRef = doc(db, EMPLOYEES_COLLECTION, id);
        batch.delete(docRef);
    });
    await batch.commit();
};

export const clearEmployees = async (): Promise<void> => {
    const q = query(collection(db, EMPLOYEES_COLLECTION));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};
