
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import type { AttendanceScan } from '@/types';

const SCANS_COLLECTION = 'scans';

// --- Firestore Helpers ---
const scansCollectionRef = collection(db, SCANS_COLLECTION);

// --- Scan Management ---
export const addScan = async (scanData: Omit<AttendanceScan, 'scanId' | 'id'>): Promise<string> => {
    const docRef = await addDoc(scansCollectionRef, scanData);
    const newId = docRef.id;
    await updateDoc(docRef, { id: newId, scanId: newId });
    return newId;
};

export const getScans = async (): Promise<AttendanceScan[]> => {
    const q = query(scansCollectionRef, orderBy('scanTime', 'desc'));
    const querySnapshot = await getDocs(q);
    const scans: AttendanceScan[] = [];
    querySnapshot.forEach((doc) => {
        scans.push(doc.data() as AttendanceScan);
    });
    return scans;
};

export const getLastScanForEmployee = async (employeeId: string): Promise<AttendanceScan | null> => {
    const q = query(scansCollectionRef, where('employeeId', '==', employeeId), orderBy('scanTime', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    return querySnapshot.docs[0].data() as AttendanceScan;
};

export const deleteScan = async (scanId: string): Promise<void> => {
    const scanDocRef = doc(db, SCANS_COLLECTION, scanId);
    await deleteDoc(scanDocRef);
};

export const deleteScansForEmployee = async (employeeId: string): Promise<void> => {
    const q = query(scansCollectionRef, where('employeeId', '==', employeeId));
    const querySnapshot = await getDocs(q);
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};
