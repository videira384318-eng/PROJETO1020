
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query } from 'firebase/firestore';
import type { Vehicle } from '@/types';

const VEHICLES_COLLECTION = 'vehicles';

const vehiclesCollectionRef = collection(db, VEHICLES_COLLECTION);

export const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'status' | 'entryTimestamp' | 'exitTimestamp'>): Promise<string> => {
    const newVehicle = {
        ...vehicleData,
        status: 'entered',
        entryTimestamp: new Date().toISOString(),
        exitTimestamp: null,
    }
    const docRef = await addDoc(vehiclesCollectionRef, newVehicle);
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

export const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<void> => {
    const vehicleDocRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    await updateDoc(vehicleDocRef, vehicleData);
};

export const deleteVehicles = async (vehicleIds: string[]): Promise<void> => {
    if (vehicleIds.length === 0) return;
    
    const batch = writeBatch(db);

    vehicleIds.forEach(id => {
        const vehicleDocRef = doc(db, VEHICLES_COLLECTION, id);
        batch.delete(vehicleDocRef);
    });

    await batch.commit();
};
