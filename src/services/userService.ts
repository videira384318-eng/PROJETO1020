
"use server";

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import type { UserProfile } from '@/types';

const USERS_COLLECTION = 'usuarios';
const usersCollectionRef = collection(db, USERS_COLLECTION);

export const getUsers = (callback: (users: UserProfile[]) => void): (() => void) => {
    const q = query(usersCollectionRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });
        callback(users.sort((a, b) => a.email.localeCompare(b.email)));
    }, (error) => {
        console.error("Erro ao buscar usuários em tempo real:", error);
        callback([]);
    });

    return unsubscribe;
};

export const updateUserRole = async (uid: string, role: UserProfile['role']): Promise<void> => {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userDocRef, { role });
};

// Note: Deleting a user from Firestore does not delete them from Firebase Auth.
// This must be done manually in the Firebase Console for now.
export const deleteUser = async (uid: string): Promise<void> => {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await deleteDoc(userDocRef);
};
