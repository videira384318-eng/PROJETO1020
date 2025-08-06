"use client";

import { db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    doc, 
    updateDoc, 
    query, 
    where, 
    getDocs,
    writeBatch,
    onSnapshot,
    Unsubscribe,
    orderBy
} from 'firebase/firestore';
import type { VisitorFormData } from '@/app/visitantes/page';

const VISITORS_COLLECTION = 'visitors';

export const addVisitor = async (visitorData: VisitorFormData): Promise<string> => {
  const docRef = await addDoc(collection(db, VISITORS_COLLECTION), visitorData);
  return docRef.id;
};

export const updateVisitor = async (visitorId: string, visitorData: Partial<VisitorFormData>): Promise<void> => {
    const docRef = doc(db, VISITORS_COLLECTION, visitorId);
    await updateDoc(docRef, visitorData);
}

export const deleteVisitorByPersonId = async (personId: string): Promise<void> => {
    const q = query(collection(db, VISITORS_COLLECTION), where('personId', '==', personId));
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
}

export const deleteVisitorsByPersonIds = async (personIds: string[]): Promise<void> => {
    if (personIds.length === 0) return;
    const batch = writeBatch(db);
    // Firestore 'in' query can take up to 30 elements
    const chunks = [];
    for (let i = 0; i < personIds.length; i += 30) {
        chunks.push(personIds.slice(i, i + 30));
    }
    for (const chunk of chunks) {
        const q = query(collection(db, VISITORS_COLLECTION), where('personId', 'in', chunk));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
    }
    await batch.commit();
}

export const deleteVisitorLog = async (visitId: string): Promise<void> => {
    await deleteDoc(doc(db, VISITORS_COLLECTION, visitId));
}

export const getVisitors = (callback: (visitors: VisitorFormData[]) => void): Unsubscribe => {
    const q = query(collection(db, VISITORS_COLLECTION), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const visitors: VisitorFormData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Ensure createdAt is a string
            const createdAt = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString();
            visitors.push({ id: doc.id, ...data, createdAt } as VisitorFormData);
        });
        callback(visitors);
    });
    return unsubscribe;
};
