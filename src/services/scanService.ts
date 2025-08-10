
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy, limit, getDoc, updateDoc } from 'firebase/firestore';
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
    const allScans = await getScans();
    const lastScan = allScans.find(scan => scan.employeeId === employeeId);
    return lastScan || null;
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
