
"use client";

import type { AttendanceScan } from '@/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, limit, writeBatch } from 'firebase/firestore';


const SCANS_COLLECTION = 'scans';


export const addScan = async (scanData: Omit<AttendanceScan, 'scanId' | 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, SCANS_COLLECTION), scanData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding scan to Firestore: ", error);
        throw new Error("Failed to add scan.");
    }
};

export const getScans = async (): Promise<AttendanceScan[]> => {
    try {
        const scansQuery = query(collection(db, SCANS_COLLECTION), orderBy("scanTime", "desc"));
        const querySnapshot = await getDocs(scansQuery);
        const scans: AttendanceScan[] = [];
        querySnapshot.forEach((doc) => {
            scans.push({ id: doc.id, scanId: doc.id, ...doc.data() } as AttendanceScan);
        });
        return scans;
    } catch (error) {
        console.error("Error getting scans from Firestore: ", error);
        throw new Error("Failed to get scans.");
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
        if (querySnapshot.empty) {
            return null;
        }
        const doc = querySnapshot.docs[0];
        return { id: doc.id, scanId: doc.id, ...doc.data() } as AttendanceScan;
    } catch (error) {
        console.error("Error getting last scan for employee from Firestore: ", error);
        throw new Error("Failed to get last scan.");
    }
};

export const deleteScan = async (scanId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, SCANS_COLLECTION, scanId));
    } catch (error) {
        console.error("Error deleting scan from Firestore: ", error);
        throw new Error("Failed to delete scan.");
    }
};

// Helper function to delete all scans for a given employeeId
export const deleteScansForEmployee = async (employeeId: string): Promise<void> => {
    try {
        const q = query(collection(db, SCANS_COLLECTION), where("employeeId", "==", employeeId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error(`Error deleting scans for employee ${employeeId}:`, error);
        // We don't re-throw here because this is part of a larger delete operation.
        // The main operation will throw its own error if it fails.
    }
};
