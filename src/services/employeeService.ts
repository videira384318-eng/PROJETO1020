
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, where, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import type { QrFormData } from '@/components/qr-generator';

const EMPLOYEES_COLLECTION = 'employees';
const SCANS_COLLECTION = 'scans';

// --- Firestore Helpers ---
const employeesCollectionRef = collection(db, EMPLOYEES_COLLECTION);
const scansCollectionRef = collection(db, SCANS_COLLECTION);

// --- Employee Management ---
export const addEmployee = async (employeeData: Omit<QrFormData, 'id'>): Promise<string> => {
    // New employees are active by default. This resolves the 'undefined' error.
    const newEmployee = { ...employeeData, active: true };
    const docRef = await addDoc(employeesCollectionRef, newEmployee);
    // Add the firestore-generated id to the document
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const addEmployeeWithId = async (employeeId: string, employeeData: QrFormData): Promise<void> => {
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await setDoc(employeeDocRef, employeeData);
};

export const updateEmployee = async (employeeId: string, employeeData: QrFormData): Promise<void> => {
    const employeeDocRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await updateDoc(employeeDocRef, employeeData);
};

export const getEmployees = (callback: (employees: QrFormData[]) => void): (() => void) => {
    const q = query(employeesCollectionRef);
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const employees: QrFormData[] = [];
        querySnapshot.forEach((doc) => {
            employees.push({ id: doc.id, ...doc.data() } as QrFormData);
        });
        callback(employees);
    }, (error) => {
        console.error("Erro ao buscar funcionários em tempo real:", error);
        callback([]);
    });

    return unsubscribe;
};


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

// Note: clearEmployees is highly destructive and should be used with caution.
// It's commented out to prevent accidental use. A more robust implementation
// would involve server-side logic or a different UI flow.
export const clearEmployees = async (): Promise<void> => {
    // This is a placeholder. A real implementation would need to handle
    // batch deletion of all documents in the collections, which can be complex
    // on the client-side for large datasets.
    console.warn("clearEmployees function is not fully implemented for Firestore client-side.");
    // For small collections, you could do:
    // const employeesSnapshot = await getDocs(employeesCollectionRef);
    // const scansSnapshot = await getDocs(scansCollectionRef);
    // const batch = writeBatch(db);
    // employeesSnapshot.forEach(doc => batch.delete(doc.ref));
    // scansSnapshot.forEach(doc => batch.delete(doc.ref));
    // await batch.commit();
};

    
