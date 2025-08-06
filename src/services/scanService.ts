"use client";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import type { AttendanceScan } from '@/types';


const SCANS_COLLECTION = 'scans';

export const addScan = async (scanData: Omit<AttendanceScan, 'scanId'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, SCANS_COLLECTION), scanData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding scan to Firestore: ", error);
        throw new Error("Could not add scan.");
    }
};

export const getScans = async (): Promise<AttendanceScan[]> => {
    try {
        const q = query(collection(db, SCANS_COLLECTION), orderBy("scanTime", "desc"));
        const querySnapshot = await getDocs(q);
        const scans: AttendanceScan[] = [];
        querySnapshot.forEach((doc) => {
            scans.push({ scanId: doc.id, ...doc.data() } as AttendanceScan);
        });
        return scans;
    } catch (error) {
        console.error("Error getting scans from Firestore: ", error);
        throw new Error("Could not get scans.");
    }
};

export const getLastScanForEmployee = async (employeeId: string): Promise<AttendanceScan | null> => {
    try {
        const q = query(
            collection(db, SCANS_COLLECTION),
            where("employeeId", "==", employeeId),
            orderBy("scanTime", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { scanId: doc.id, ...doc.data() } as AttendanceScan;
        }
        return null;
    } catch (error) {
        console.error(`Error getting last scan for employee ${employeeId}: `, error);
        throw new Error("Could not get last scan.");
    }
};

export const deleteScan = async (scanId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, SCANS_COLLECTION, scanId));
    } catch (error) {
        console.error("Error deleting scan from Firestore: ", error);
        throw new Error("Could not delete scan.");
    }
};
