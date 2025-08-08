
"use server";

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type { UserProfile } from '@/types';

const USERS_COLLECTION = 'usuarios';
const usersCollectionRef = collection(db, USERS_COLLECTION);

export const getUsers = async (): Promise<UserProfile[]> => {
    const querySnapshot = await getDocs(usersCollectionRef);
    const users: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
    });
    return users.sort((a, b) => a.email.localeCompare(b.email));
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
