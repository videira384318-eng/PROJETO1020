

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
    Unsubscribe,
    where,
    getDocs,
    getDoc,
    setDoc
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

export const verifyUser = async (username: string, password: string): Promise<Role | null> => {
    // Special handling for the admin user. If it's the first login, create it.
    if (username.toLowerCase() === 'adm') {
        const admUserRef = doc(db, USERS_COLLECTION, 'adm_user');
        const admUserSnap = await getDoc(admUserRef);
        
        // If admin user doesn't exist, create it with the default password.
        if (!admUserSnap.exists()) {
            if (password === 'admin123') {
                console.log("Creating default administrator user...");
                await setDoc(admUserRef, {
                    username: "adm",
                    password: "admin123",
                    role: "adm"
                });
                return 'adm';
            } else {
                return null; // Incorrect password for initial admin creation
            }
        }
    }
    
    // For all other users (and subsequent admin logins)
    const q = query(collection(db, USERS_COLLECTION), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
        return null; // User not found
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data() as User;

    if (userData.password === password) {
        return userData.role;
    }

    return null; // Password incorrect
}

export const addUser = async (userData: Omit<User, 'id'>): Promise<string> => {
    // Check if username already exists
    const q = query(collection(db, USERS_COLLECTION), where("username", "==", userData.username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        throw new Error("Username already exists.");
    }
    const docRef = await addDoc(collection(db, USERS_COLLECTION), userData);
    return docRef.id;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const updateData: Partial<User> = {};

    if (userData.username) {
        updateData.username = userData.username;
    }
     if (userData.password) {
        updateData.password = userData.password;
    }
    if (userData.role) {
        updateData.role = userData.role;
    }
    
    await updateDoc(docRef, updateData);
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
