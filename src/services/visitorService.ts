
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, where, getDoc } from 'firebase/firestore';
import type { Visitor } from '@/types';
import { deleteVisitsForVisitor } from './visitLogService';

const VISITORS_COLLECTION = 'visitors';

const visitorsCollectionRef = collection(db, VISITORS_COLLECTION);

export const addVisitor = async (visitorData: Omit<Visitor, 'id'>): Promise<string> => {
    const docRef = await addDoc(visitorsCollectionRef, visitorData);
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

export const getVisitor = async (visitorId: string): Promise<Visitor | null> => {
    if (!visitorId) return null;
    const docRef = doc(db, VISITORS_COLLECTION, visitorId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Visitor;
    }
    return null;
}


export const updateVisitor = async (visitorId: string, visitorData: Partial<Visitor>): Promise<void> => {
    const visitorDocRef = doc(db, VISITORS_COLLECTION, visitorId);
    await updateDoc(visitorDocRef, visitorData);
};

export const deleteVisitors = async (visitorIds: string[]): Promise<void> => {
    if (visitorIds.length === 0) return;
    
    const batch = writeBatch(db);

    for (const id of visitorIds) {
        // Delete the visitor document
        const visitorDocRef = doc(db, VISITORS_COLLECTION, id);
        batch.delete(visitorDocRef);

        // Delete all associated visit logs
        await deleteVisitsForVisitor(id, batch);
    }

    await batch.commit();
};
