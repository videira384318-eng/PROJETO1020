"use client";

import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    doc, 
    deleteDoc, 
    updateDoc,
    query, 
    onSnapshot, 
    Unsubscribe,
    orderBy
} from 'firebase/firestore';
import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';

const VEHICLES_COLLECTION = 'vehicles';
const VEHICLE_LOG_COLLECTION = 'vehicle_log';

// Vehicle Management
export const addVehicle = async (vehicleData: Omit<VehicleFormData, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), vehicleData);
  return docRef.id;
};

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<VehicleFormData>): Promise<void> => {
    const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    await updateDoc(docRef, vehicleData);
}

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
};

export const getVehicles = (callback: (vehicles: VehicleFormData[]) => void): Unsubscribe => {
    const q = query(collection(db, VEHICLES_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const vehicles: VehicleFormData[] = [];
        querySnapshot.forEach((doc) => {
            vehicles.push({ id: doc.id, ...doc.data() } as VehicleFormData);
        });
        callback(vehicles);
    });
    return unsubscribe;
};

// Vehicle Log Management
export const addVehicleLog = async (logData: Omit<VehicleLogEntry, 'logId'>): Promise<string> => {
    const docRef = await addDoc(collection(db, VEHICLE_LOG_COLLECTION), logData);
    return docRef.id;
};

export const updateVehicleLog = async (logId: string, logData: Partial<VehicleLogEntry>): Promise<void> => {
    const docRef = doc(db, VEHICLE_LOG_COLLECTION, logId);
    await updateDoc(docRef, logData);
};

export const deleteVehicleLog = async (logId: string): Promise<void> => {
    await deleteDoc(doc(db, VEHICLE_LOG_COLLECTION, logId));
};

export const getVehicleLog = (callback: (log: VehicleLogEntry[]) => void): Unsubscribe => {
    const q = query(collection(db, VEHICLE_LOG_COLLECTION), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const logEntries: VehicleLogEntry[] = [];
        querySnapshot.forEach((doc) => {
            logEntries.push({ logId: doc.id, ...doc.data() } as VehicleLogEntry);
        });
        callback(logEntries);
    });
    return unsubscribe;
};
