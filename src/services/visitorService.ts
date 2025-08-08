
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, where, Timestamp } from 'firebase/firestore';
import type { VisitorFormData } from '@/app/visitantes/page';

const VISITORS_COLLECTION = 'visitors';

const visitorsCollectionRef = collection(db, VISITORS_COLLECTION);

// --- Visitor Management ---
export const addVisitor = async (visitorData: Omit<VisitorFormData, 'id'>): Promise<string> => {
    const docRef = await addDoc(visitorsCollectionRef, {
        ...visitorData,
        createdAt: Timestamp.fromDate(new Date(visitorData.createdAt!)),
        entryTime: visitorData.entryTime ? Timestamp.fromDate(new Date(visitorData.entryTime)) : null,
        exitTime: visitorData.exitTime ? Timestamp.fromDate(new Date(visitorData.exitTime)) : null,
    });
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const updateVisitor = async (visitorId: string, visitorData: Partial<VisitorFormData>): Promise<void> => {
    const visitorDocRef = doc(db, VISITORS_COLLECTION, visitorId);
    const updateData = { ...visitorData } as any;

    // Convert date strings to Timestamps if they exist
    if (visitorData.createdAt) {
        updateData.createdAt = Timestamp.fromDate(new Date(visitorData.createdAt));
    }
    if (visitorData.entryTime) {
        updateData.entryTime = Timestamp.fromDate(new Date(visitorData.entryTime));
    }
    if (visitorData.exitTime) {
        updateData.exitTime = Timestamp.fromDate(new Date(visitorData.exitTime));
    } else if (visitorData.hasOwnProperty('exitTime')) {
        updateData.exitTime = null;
    }


    await updateDoc(visitorDocRef, updateData);
};


export const getVisitors = async (): Promise<VisitorFormData[]> => {
    const querySnapshot = await getDocs(visitorsCollectionRef);
    const visitors: VisitorFormData[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        visitors.push({ 
            ...data,
            id: doc.id,
            // Convert Timestamps to ISO strings
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : undefined,
            entryTime: data.entryTime ? (data.entryTime as Timestamp).toDate().toISOString() : undefined,
            exitTime: data.exitTime ? (data.exitTime as Timestamp).toDate().toISOString() : undefined,
        } as VisitorFormData);
    });
    return visitors;
};

export const deleteVisitorByPersonId = async (personId: string): Promise<void> => {
    const batch = writeBatch(db);
    const q = query(visitorsCollectionRef, where('personId', '==', personId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const deleteVisitorsByPersonIds = async (personIds: string[]): Promise<void> => {
    if (personIds.length === 0) return;
    const batch = writeBatch(db);
    const q = query(visitorsCollectionRef, where('personId', 'in', personIds));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const deleteVisitorLog = async (visitId: string): Promise<void> => {
    const visitorDocRef = doc(db, VISITORS_COLLECTION, visitId);
    await deleteDoc(visitorDocRef);
};
