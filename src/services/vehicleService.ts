
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, where, orderBy, limit, getDoc, Timestamp } from 'firebase/firestore';
import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';


const VEHICLES_COLLECTION = 'vehicles';
const VEHICLE_LOG_COLLECTION = 'vehicle_log';

const vehiclesCollectionRef = collection(db, VEHICLES_COLLECTION);
const vehicleLogCollectionRef = collection(db, VEHICLE_LOG_COLLECTION);


// --- Vehicle Management ---
export const addVehicle = async (vehicleData: Omit<VehicleFormData, 'id'>): Promise<string> => {
    const docRef = await addDoc(vehiclesCollectionRef, vehicleData);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<VehicleFormData>): Promise<void> => {
    const vehicleDocRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    await updateDoc(vehicleDocRef, vehicleData);
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    const batch = writeBatch(db);
    const vehicleDocRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    batch.delete(vehicleDocRef);

    const logsQuery = query(vehicleLogCollectionRef, where('id', '==', vehicleId));
    const logsSnapshot = await getDocs(logsQuery);
    logsSnapshot.forEach(logDoc => {
        batch.delete(logDoc.ref);
    });

    await batch.commit();
};

export const getVehicles = async (): Promise<VehicleFormData[]> => {
    const q = query(vehiclesCollectionRef);
    const querySnapshot = await getDocs(q);
    const vehicles: VehicleFormData[] = [];
    querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() } as VehicleFormData);
    });
    return vehicles;
};

// --- Vehicle Log Management ---
export const addVehicleLog = async (logData: Omit<VehicleLogEntry, 'logId'>): Promise<string> => {
    const docRef = await addDoc(vehicleLogCollectionRef, {
        ...logData,
        timestamp: Timestamp.fromDate(new Date(logData.timestamp))
    });
    await updateDoc(docRef, { logId: docRef.id });
    return docRef.id;
};

export const updateVehicleLog = async (logId: string, logData: Partial<Omit<VehicleLogEntry, 'logId' | 'id'>>): Promise<void> => {
    const logDocRef = doc(db, VEHICLE_LOG_COLLECTION, logId);
    const updateData = { ...logData } as any;
    if (logData.timestamp) {
        updateData.timestamp = Timestamp.fromDate(new Date(logData.timestamp));
    }
    await updateDoc(logDocRef, updateData);
};

export const deleteVehicleLog = async (logId: string): Promise<void> => {
    const logDocRef = doc(db, VEHICLE_LOG_COLLECTION, logId);
    await deleteDoc(logDocRef);
};

export const getVehicleLog = async (): Promise<VehicleLogEntry[]> => {
    const q = query(vehicleLogCollectionRef, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const logs: VehicleLogEntry[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({ 
            ...data,
            timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
        } as VehicleLogEntry);
    });
    return logs;
};


export const getLastVehicleLog = async (vehicleId: string): Promise<VehicleLogEntry | null> => {
    const q = query(
        vehicleLogCollectionRef,
        where('id', '==', vehicleId),
        orderBy('timestamp', 'desc'),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const data = querySnapshot.docs[0].data();
    return {
        ...data,
        timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
    } as VehicleLogEntry
};
