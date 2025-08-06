"use client";

import { db } from '@/lib/firebase';
import { collection, addDoc, doc, deleteDoc, query, onSnapshot, Unsubscribe, orderBy } from 'firebase/firestore';
import type { AttendanceScan } from '@/types';

const SCANS_COLLECTION = 'scans';

export const addScan = async (scanData: Omit<AttendanceScan, 'scanId'>): Promise<string> => {
  const docRef = await addDoc(collection(db, SCANS_COLLECTION), scanData);
  return docRef.id;
};

export const deleteScan = async (scanId: string): Promise<void> => {
    await deleteDoc(doc(db, SCANS_COLLECTION, scanId));
};

export const getScans = (callback: (scans: AttendanceScan[]) => void): Unsubscribe => {
    const q = query(collection(db, SCANS_COLLECTION), orderBy('scanTime', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const scans: AttendanceScan[] = [];
        querySnapshot.forEach((doc) => {
            scans.push({ scanId: doc.id, ...doc.data() } as AttendanceScan);
        });
        callback(scans);
    });
    return unsubscribe;
};
