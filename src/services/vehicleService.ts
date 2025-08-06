"use client";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, where, limit } from 'firebase/firestore';
import type { VehicleFormData, VehicleLogEntry } from '@/app/veiculos/page';

const VEHICLES_COLLECTION = 'vehicles';
const VEHICLE_LOG_COLLECTION = 'vehicle_log';

// --- Vehicle Management ---
export const addVehicle = async (vehicleData: Omit<VehicleFormData, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), vehicleData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding vehicle: ", error);
        throw new Error("Could not add vehicle.");
    }
};

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<VehicleFormData>): Promise<void> => {
    try {
        const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
        await updateDoc(docRef, vehicleData);
    } catch (error) {
        console.error("Error updating vehicle: ", error);
        throw new Error("Could not update vehicle.");
    }
};

export const deleteVehicle = async (vehicleId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
    } catch (error) {
        console.error("Error deleting vehicle: ", error);
        throw new Error("Could not delete vehicle.");
    }
};

export const getVehicles = async (): Promise<VehicleFormData[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, VEHICLES_COLLECTION));
        const vehicles: VehicleFormData[] = [];
        querySnapshot.forEach((doc) => {
            vehicles.push({ id: doc.id, ...doc.data() } as VehicleFormData);
        });
        return vehicles;
    } catch (error) {
        console.error("Error getting vehicles: ", error);
        throw new Error("Could not get vehicles.");
    }
};

// --- Vehicle Log Management ---
export const addVehicleLog = async (logData: Omit<VehicleLogEntry, 'logId'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, VEHICLE_LOG_COLLECTION), logData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding vehicle log: ", error);
        throw new Error("Could not add vehicle log.");
    }
};

export const updateVehicleLog = async (logId: string, logData: Partial<Omit<VehicleLogEntry, 'logId' | 'id'>>): Promise<void> => {
    try {
        const docRef = doc(db, VEHICLE_LOG_COLLECTION, logId);
        await updateDoc(docRef, logData);
    } catch (error) {
        console.error("Error updating vehicle log: ", error);
        throw new Error("Could not update vehicle log.");
    }
};

export const deleteVehicleLog = async (logId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, VEHICLE_LOG_COLLECTION, logId));
    } catch (error) {
        console.error("Error deleting vehicle log: ", error);
        throw new Error("Could not delete vehicle log.");
    }
};

export const getVehicleLog = async (): Promise<VehicleLogEntry[]> => {
    try {
        const q = query(collection(db, VEHICLE_LOG_COLLECTION), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const log: VehicleLogEntry[] = [];
        querySnapshot.forEach((doc) => {
            log.push({ logId: doc.id, ...doc.data() } as VehicleLogEntry);
        });
        return log;
    } catch (error) {
        console.error("Error getting vehicle log: ", error);
        throw new Error("Could not get vehicle log.");
    }
};

export const getLastVehicleLog = async (vehicleId: string): Promise<VehicleLogEntry | null> => {
    try {
        const q = query(
            collection(db, VEHICLE_LOG_COLLECTION),
            where("id", "==", vehicleId),
            orderBy("timestamp", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            return { logId: doc.id, ...doc.data() } as VehicleLogEntry;
        }
        return null;
    } catch (error) {
        console.error(`Error getting last log for vehicle ${vehicleId}: `, error);
        throw new Error("Could not get last vehicle log.");
    }
}
