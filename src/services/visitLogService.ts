
import { db } from '@/lib/firebase';
import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch, query, where, orderBy, limit } from 'firebase/firestore';
import type { VisitLog } from '@/types';

const VISITS_COLLECTION = 'visits';

const visitsCollectionRef = collection(db, VISITS_COLLECTION);

type VisitLogCreate = Omit<VisitLog, 'id' | 'status' | 'entryTimestamp' | 'exitTimestamp'>;

export const addVisitLog = async (visitData: VisitLogCreate): Promise<string> => {
    const newVisit = {
        ...visitData,
        status: 'entered',
        entryTimestamp: new Date().toISOString(),
        exitTimestamp: null,
    } as const;
    const docRef = await addDoc(visitsCollectionRef, newVisit);
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
};

export const getVisits = async (): Promise<VisitLog[]> => {
    const q = query(visitsCollectionRef, orderBy('entryTimestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const visits: VisitLog[] = [];
    querySnapshot.forEach((doc) => {
        visits.push(doc.data() as VisitLog);
    });
    return visits;
};

export const updateVisitLog = async (visitId: string, visitData: Partial<Omit<VisitLog, 'id'>>): Promise<void> => {
    const visitDocRef = doc(db, VISITS_COLLECTION, visitId);
    await updateDoc(visitDocRef, visitData);
};

export const getLastVisitForVisitor = async (visitorId: string): Promise<VisitLog | null> => {
    const q = query(
        visitsCollectionRef,
        where('visitorId', '==', visitorId),
        orderBy('entryTimestamp', 'desc'),
        limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }
    
    return querySnapshot.docs[0].data() as VisitLog;
};

// Used when deleting a visitor profile
export const deleteVisitsForVisitor = async (visitorId: string, batch?: ReturnType<typeof writeBatch>): Promise<void> => {
    const q = query(visitsCollectionRef, where('visitorId', '==', visitorId));
    const querySnapshot = await getDocs(q);
    
    if (batch) {
        querySnapshot.forEach(doc => batch.delete(doc.ref));
    } else {
        const localBatch = writeBatch(db);
        querySnapshot.forEach(doc => localBatch.delete(doc.ref));
        await localBatch.commit();
    }
};
