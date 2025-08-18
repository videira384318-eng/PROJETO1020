
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, where, getDoc, setDoc } from 'firebase/firestore';
import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_COLLECTION = 'employees';
const SCANS_COLLECTION = 'scans';

// --- Firestore Helpers ---
const employeesCollectionRef = collection(db, EMPLOYEES_COLLECTION);
const scansCollectionRef = collection(db, SCANS_COLLECTION);

// --- Employee Management ---

// This new function will use setDoc to enforce the ID from the client.
export const addEmployee = async (employeeData: QrFormData): Promise<string> => {
    if (!employeeData.id) {
        throw new Error("Employee ID is missing.");
    }
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employeeData.id);
    const newEmployee = { ...employeeData, active: employeeData.active ?? true };
    await setDoc(employeeDocRef, newEmployee);
    return employeeData.id;
};


export const addEmployeeWithId = async (employeeId: string, employeeData: QrFormData): Promise<void> => {
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await setDoc(employeeDocRef, employeeData);
};

export const updateEmployee = async (employeeId: string, employeeData: QrFormData): Promise<void> => {
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await updateDoc(employeeDocRef, employeeData as any);
};

export const getEmployees = async (): Promise<QrFormData[]> => {
    const q = query(employeesCollectionRef);
    const querySnapshot = await getDocs(q);
    const employees: QrFormData[] = [];
    querySnapshot.forEach((doc) => {
        employees.push({ id: doc.id, ...doc.data() } as QrFormData);
    });
    return employees;
};

export const getEmployeeById = async (employeeId: string): Promise<QrFormData | null> => {
    if (!employeeId) return null;
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    const docSnap = await getDoc(employeeDocRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as QrFormData;
    }
    return null;
}


export const deleteEmployees = async (employeeIds: string[]): Promise<void> => {
    if (employeeIds.length === 0) return;
    
    const batch = writeBatch(db);

    // Delete employees
    employeeIds.forEach(id => {
        const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, id);
        batch.delete(employeeDocRef);
    });

    // Delete associated scans
    const scansQuery = query(scansCollectionRef, where('employeeId', 'in', employeeIds));
    const scansSnapshot = await getDocs(scansQuery);
    scansSnapshot.forEach(scanDoc => {
        batch.delete(scanDoc.ref);
    });

    await batch.commit();
};

export const clearEmployees = async (): Promise<void> => {
    console.warn("clearEmployees function is not fully implemented for Firestore client-side.");
};
