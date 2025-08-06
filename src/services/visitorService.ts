"use client";

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, writeBatch, query, where } from 'firebase/firestore';
import type { VisitorFormData } from '@/app/visitantes/page';

const VISITORS_COLLECTION = 'visitors';

export const addVisitor = async (visitorData: Omit<VisitorFormData, 'id'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, VISITORS_COLLECTION), visitorData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding visitor: ", error);
        throw new Error("Could not add visitor.");
    }
};

export const updateVisitor = async (visitorId: string, visitorData: Partial<VisitorFormData>): Promise<void> => {
    try {
        const docRef = doc(db, VISITORS_COLLECTION, visitorId);
        await updateDoc(docRef, visitorData);
    } catch (error) {
        console.error("Error updating visitor: ", error);
        throw new Error("Could not update visitor.");
    }
};

export const getVisitors = async (): Promise<VisitorFormData[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, VISITORS_COLLECTION));
        const visitors: VisitorFormData[] = [];
        querySnapshot.forEach((doc) => {
            visitors.push({ id: doc.id, ...doc.data() } as VisitorFormData);
        });
        return visitors;
    } catch (error) {
        console.error("Error getting visitors: ", error);
        throw new Error("Could not get visitors.");
    }
};

export const deleteVisitorByPersonId = async (personId: string): Promise<void> => {
    try {
        const q = query(collection(db, VISITORS_COLLECTION), where("personId", "==", personId));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error deleting visitor by personId: ", error);
        throw new Error("Could not delete visitor.");
    }
};

export const deleteVisitorsByPersonIds = async (personIds: string[]): Promise<void> => {
    if (personIds.length === 0) return;
    try {
        const q = query(collection(db, VISITORS_COLLECTION), where("personId", "in", personIds));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    } catch (error) {
        console.error("Error deleting visitors by personIds: ", error);
        throw new Error("Could not delete visitors.");
    }
};

export const deleteVisitorLog = async (visitId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, VISITORS_COLLECTION, visitId));
    } catch (error) {
        console.error("Error deleting visitor log: ", error);
        throw new Error("Could not delete visitor log.");
    }
};
