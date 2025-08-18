
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, writeBatch, query, orderBy, where, limit } from 'firebase/firestore';
import type { VehicleLog } from '@/types';

const LOGS_COLLECTION = 'vehicleLogs';

const logsCollectionRef = collection(db, LOGS_COLLECTION);

type VehicleLogCreate = Omit<VehicleLog, 'id' | 'status' | 'entryTimestamp' | 'exitTimestamp'>;

export const addVehicleLog = async (logData: VehicleLogCreate): Promise<string> => {
    const newLog = {
        ...logData,
        status: 'entered',
        entryTimestamp: new Date().toISOString(),
        exitTimestamp: null,
    } as const;
    const docRef = await addDoc(logsCollectionRef, newLog);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const getVehicleLogs = async (): Promise<VehicleLog[]> => {
    const q = query(logsCollectionRef, orderBy('entryTimestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const logs: VehicleLog[] = [];
    querySnapshot.forEach((doc) => {
        logs.push(doc.data() as VehicleLog);
    });
    return logs;
};

export const updateVehicleLog = async (logId: string, logData: Partial<Omit<VehicleLog, 'id'>>): Promise<void> => {
    const logDocRef = doc(db, LOGS_COLLECTION, logId);
    await updateDoc(logDocRef, logData);
};

export const getLastLogForVehicle = async (vehicleId: string): Promise<VehicleLog | null> => {
    const q = query(
        logsCollectionRef,
        where('vehicleId', '==', vehicleId),
        orderBy('entryTimestamp', 'desc'),
        limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    return querySnapshot.docs[0].data() as VehicleLog;
};

// Used when deleting a vehicle profile
export const deleteLogsForVehicle = async (vehicleId: string, batch?: ReturnType<typeof writeBatch>): Promise<void> => {
    const q = query(logsCollectionRef, where('vehicleId', '==', vehicleId));
    const querySnapshot = await getDocs(q);
    
    if (batch) {
        querySnapshot.forEach(doc => batch.delete(doc.ref));
    } else {
        const localBatch = writeBatch(db);
        querySnapshot.forEach(doc => localBatch.delete(doc.ref));
        await localBatch.commit();
    }
};
