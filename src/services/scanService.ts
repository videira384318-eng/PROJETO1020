
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import type { AttendanceScan } from '@/types';

const SCANS_COLLECTION = 'scans';

// --- Firestore Helpers ---
const scansCollectionRef = collection(db, SCANS_COLLECTION);

// --- Scan Management ---
export const addScan = async (scanData: Omit<AttendanceScan, 'scanId' | 'id'>): Promise<string> => {
    const docRef = await addDoc(scansCollectionRef, scanData);
    // Add the firestore-generated id as scanId for consistency
    const newId = docRef.id;
    await updateDoc(docRef, { id: newId, scanId: newId });
    return newId;
};

export const getScans = (callback: (scans: AttendanceScan[]) => void): (() => void) => {
    const q = query(scansCollectionRef, orderBy('scanTime', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const scans: AttendanceScan[] = [];
        querySnapshot.forEach((doc) => {
            scans.push(doc.data() as AttendanceScan);
        });
        callback(scans);
    }, (error) => {
        console.error("Erro ao buscar registros em tempo real:", error);
        callback([]);
    });

    return unsubscribe;
};


export const getLastScanForEmployee = async (employeeId: string): Promise<AttendanceScan | null> => {
    // Modified query to avoid composite index requirement.
    // Filtering is done by Firestore, ordering is done client-side.
    const q = query(scansCollectionRef, where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    // Sort documents on the client-side to find the most recent one.
    const scans = querySnapshot.docs.map(doc => doc.data() as AttendanceScan);
    scans.sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime());
    
    return scans[0];
};

export const deleteScan = async (scanId: string): Promise<void> => {
    const scanDocRef = doc(db, SCANS_COLLECTION, scanId);
    await deleteDoc(scanDocRef);
};

export const deleteScansForEmployee = async (employeeId: string): Promise<void> => {
    const q = query(scansCollectionRef, where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    
    // Using Promise.all to delete all found documents
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};

