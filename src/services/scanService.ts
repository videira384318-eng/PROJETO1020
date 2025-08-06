
"use client";

import type { AttendanceScan } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';

const SCANS_COLLECTION = 'scans';

export const addScan = async (scanData: Omit<AttendanceScan, 'scanId'>): Promise<string> => {
    const docRef = await addDoc(collection(db, SCANS_COLLECTION), scanData);
    return docRef.id;
};

export const getScans = async (): Promise<AttendanceScan[]> => {
    const q = query(collection(db, SCANS_COLLECTION), orderBy('scanTime', 'desc'));
    const querySnapshot = await getDocs(q);
    const scans: AttendanceScan[] = [];
    querySnapshot.forEach((doc) => {
        scans.push({ scanId: doc.id, ...doc.data() } as AttendanceScan);
    });
    return scans;
};

export const getLastScanForEmployee = async (employeeId: string): Promise<AttendanceScan | null> => {
    const q = query(
        collection(db, SCANS_COLLECTION), 
        where('employeeId', '==', employeeId), 
        orderBy('scanTime', 'desc'), 
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const docData = querySnapshot.docs[0];
    return { scanId: docData.id, ...docData.data() } as AttendanceScan;
};

export const deleteScan = async (scanId: string): Promise<void> => {
    await deleteDoc(doc(db, SCANS_COLLECTION, scanId));
};
