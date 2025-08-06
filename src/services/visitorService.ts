
"use client";

import type { VisitorFormData } from '@/app/visitantes/page';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, writeBatch } from 'firebase/firestore';

const VISITORS_COLLECTION = 'visitors';

export const addVisitor = async (visitorData: Omit<VisitorFormData, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, VISITORS_COLLECTION), visitorData);
    return docRef.id;
};

export const updateVisitor = async (visitorId: string, visitorData: Partial<VisitorFormData>): Promise<void> => {
    const visitorRef = doc(db, VISITORS_COLLECTION, visitorId);
    await updateDoc(visitorRef, visitorData);
};

export const getVisitors = async (): Promise<VisitorFormData[]> => {
    const q = query(collection(db, VISITORS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const visitors: VisitorFormData[] = [];
    querySnapshot.forEach((doc) => {
        visitors.push({ id: doc.id, ...doc.data() } as VisitorFormData);
    });
    return visitors;
};

export const deleteVisitorByPersonId = async (personId: string): Promise<void> => {
    const q = query(collection(db, VISITORS_COLLECTION), where('personId', '==', personId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const deleteVisitorsByPersonIds = async (personIds: string[]): Promise<void> => {
    if (personIds.length === 0) return;
    const q = query(collection(db, VISITORS_COLLECTION), where('personId', 'in', personIds));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return;
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
};

export const deleteVisitorLog = async (visitId: string): Promise<void> => {
    await deleteDoc(doc(db, VISITORS_COLLECTION, visitId));
};
