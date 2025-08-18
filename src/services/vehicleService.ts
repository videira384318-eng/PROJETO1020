

import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, getDoc, where } from 'firebase/firestore';
import type { Vehicle } from '@/types';
import { deleteLogsForVehicle } from './vehicleLogService';

const VEHICLES_COLLECTION = 'vehicles';

const vehiclesCollectionRef = collection(db, VEHICLES_COLLECTION);

export const addVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<string> => {
    // Check if a vehicle with the same plate already exists
    const q = query(vehiclesCollectionRef, where("plate", "==", vehicleData.plate));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        // Return existing vehicle ID if found
        return querySnapshot.docs[0].id;
    }

    // If not found, create a new one
    const docRef = await addDoc(vehiclesCollectionRef, vehicleData);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const getVehicles = async (): Promise<Vehicle[]> => {
    const q = query(vehiclesCollectionRef);
    const querySnapshot = await getDocs(q);
    const vehicles: Vehicle[] = [];
    querySnapshot.forEach((doc) => {
        vehicles.push(doc.data() as Vehicle);
    });
    return vehicles;
};

export const getVehicle = async (vehicleId: string): Promise<Vehicle | null> => {
    if (!vehicleId) return null;
    const docRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Vehicle;
    }
    return null;
}

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<void> => {
    const vehicleDocRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    await updateDoc(vehicleDocRef, vehicleData);
};

export const deleteVehicles = async (vehicleIds: string[]): Promise<void> => {
    if (vehicleIds.length === 0) return;
    
    const batch = writeBatch(db);

    for (const id of vehicleIds) {
        const vehicleDocRef = doc(db, VEHICLES_COLLECTION, id);
        batch.delete(vehicleDocRef);
        // Also delete all associated logs
        await deleteLogsForVehicle(id, batch);
    }

    await batch.commit();
};
