
"use client";

import { db } from '@/lib/firebase';
import {
    collection,
    addDoc,
    doc,
    deleteDoc,
    updateDoc,
    query,
    onSnapshot,
    Unsubscribe
} from 'firebase/firestore';
import type { Role } from '@/contexts/auth-context';


export interface User {
    id: string;
    username: string;
    password?: string; // Stored hashed in a real app
    role: Role;
}

const USERS_COLLECTION = 'users';

// Note: In a real-world application, password handling would involve hashing.
// Here we store it as plain text for simplicity of the simulation.

export const addUser = async (userData: Omit<User, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userData);
    return docRef.id;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(docRef, userData);
};

export const deleteUser = async (userId: string): Promise<void> => {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
};

export const getUsers = (callback: (users: User[]) => void): Unsubscribe => {
    const q = query(collection(db, USERS_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() } as User);
        });
        callback(users);
    });
    return unsubscribe;
};
