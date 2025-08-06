"use client";

import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, limit } from 'firebase/firestore';


const VEHICLES_COLLECTION = 'vehicles';
const VEHICLE_LOG_COLLECTION = 'vehicle_log';

// --- Vehicle Management ---
export const addVehicle = async (vehicleData: Omit<VehicleFormData, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), vehicleData);
    return docRef.id;
};

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<VehicleFormData>): Promise<void> => {
    const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    await updateDoc(vehicleRef, vehicleData);
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
};

export const getVehicles = async (): Promise<VehicleFormData[]> => {
    const q = query(collection(db, VEHICLES_COLLECTION));
    const querySnapshot = await getDocs(q);
    const vehicles: VehicleFormData[] = [];
    querySnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() } as VehicleFormData);
    });
    return vehicles;
};

// --- Vehicle Log Management ---
export const addVehicleLog = async (logData: Omit<VehicleLogEntry, 'logId'>): Promise<string> => {
    const docRef = await addDoc(collection(db, VEHICLE_LOG_COLLECTION), logData);
    return docRef.id;
};

export const updateVehicleLog = async (logId: string, logData: Partial<Omit<VehicleLogEntry, 'logId' | 'id'>>): Promise<void> => {
    const logRef = doc(db, VEHICLE_LOG_COLLECTION, logId);
    await updateDoc(logRef, logData);
};

export const deleteVehicleLog = async (logId: string): Promise<void> => {
    await deleteDoc(doc(db, VEHICLE_LOG_COLLECTION, logId));
};

export const getVehicleLog = async (): Promise<VehicleLogEntry[]> => {
    const q = query(collection(db, VEHICLE_LOG_COLLECTION));
    const querySnapshot = await getDocs(q);
    const logs: VehicleLogEntry[] = [];
    querySnapshot.forEach((doc) => {
        logs.push({ logId: doc.id, ...doc.data() } as VehicleLogEntry);
    });
    return logs;
};

export const getLastVehicleLog = async (vehicleId: string): Promise<VehicleLogEntry | null> => {
    const q = query(
        collection(db, VEHICLE_LOG_COLLECTION),
        where('id', '==', vehicleId),
        orderBy('timestamp', 'desc'),
        limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const logDoc = querySnapshot.docs[0];
    return { logId: logDoc.id, ...logDoc.data() } as VehicleLogEntry;
}
