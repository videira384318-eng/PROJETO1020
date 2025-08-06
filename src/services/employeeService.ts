"use client";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, writeBatch, query, onSnapshot, Unsubscribe } from 'firebase/firestore';
import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_COLLECTION = 'employees';

export const addEmployee = async (employeeData: Omit<QrFormData, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), employeeData);
  return docRef.id;
};

export const deleteEmployees = async (employeeIds: string[]): Promise<void> => {
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
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export const getEmployees = (callback: (employees: QrFormData[]) => void): Unsubscribe => {
    const q = query(collection(db, EMPLOYEES_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const employees: QrFormData[] = [];
        querySnapshot.forEach((doc) => {
            employees.push({ id: doc.id, ...doc.data() } as QrFormData);
        });
        callback(employees);
    });
    return unsubscribe;
};
