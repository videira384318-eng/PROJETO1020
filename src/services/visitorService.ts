
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query } from 'firebase/firestore';
import type { Visitor } from '@/types';

const VISITORS_COLLECTION = 'visitors';

const visitorsCollectionRef = collection(db, VISITORS_COLLECTION);

export const addVisitor = async (visitorData: Omit<Visitor, 'id' | 'status' | 'entryTimestamp' | 'exitTimestamp'>): Promise<string> => {
    const newVisitor = {
        ...visitorData,
        status: 'entered',
        entryTimestamp: new Date().toISOString(),
        exitTimestamp: null,
    }
    const docRef = await addDoc(visitorsCollectionRef, newVisitor);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const getVisitors = async (): Promise<Visitor[]> => {
    const q = query(visitorsCollectionRef);
    const querySnapshot = await getDocs(q);
    const visitors: Visitor[] = [];
    querySnapshot.forEach((doc) => {
        visitors.push(doc.data() as Visitor);
    });
    return visitors;
};

export const updateVisitor = async (visitorId: string, visitorData: Partial<Visitor>): Promise<void> => {
    const visitorDocRef = doc(db, VISITORS_COLLECTION, visitorId);
    await updateDoc(visitorDocRef, visitorData);
};

export const deleteVisitors = async (visitorIds: string[]): Promise<void> => {
    if (visitorIds.length === 0) return;
    
    const batch = writeBatch(db);

    visitorIds.forEach(id => {
        const visitorDocRef = doc(db, VISITORS_COLLECTION, id);
        batch.delete(visitorDocRef);
    });

    await batch.commit();
};
