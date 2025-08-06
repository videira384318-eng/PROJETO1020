
"use client";

import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    deleteDoc,
    updateDoc,
    query,
    onSnapshot,
    Unsubscribe,
    getDoc,
    setDoc,
} from 'firebase/firestore';
import type { Role } from '@/contexts/auth-context';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
} from "firebase/auth";


export interface User {
    id: string; // This will be the UID from Firebase Auth
    email: string;
    password?: string; // Only used for creation, not stored in Firestore
    role: Role;
}

const USERS_COLLECTION = 'users'; // This collection stores user roles and other data
const auth = getAuth();


export const getUserRole = async (uid: string): Promise<Role | null> => {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return (docSnap.data() as User).role;
    } else {
        // This handles the case where the admin user is created in the console
        // but doesn't have a user document in firestore yet.
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid && currentUser.email === "adm@empresa.com") {
            try {
                await setDoc(docRef, { email: currentUser.email, role: 'adm' });
                return 'adm';
            } catch (error) {
                console.error("Error creating admin user document in Firestore:", error);
                return null;
            }
        }
    }
    return null;
}

// Function to add a user in Auth and Firestore
export const addUser = async (userData: Omit<User, 'id'>): Promise<string> => {
    if (!userData.password) {
        throw new Error("Password is required to create a user.");
    }
    
    // Step 1: Create user in Firebase Authentication
    // Note: This uses the global auth instance. For more complex apps, you might pass auth around.
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    const { uid } = userCredential.user;

    // Step 2: Store user role in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(userDocRef, {
        email: userData.email,
        role: userData.role,
    });

    return uid;
};

// Function to update a user's role in Firestore
export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const updateData: Partial<Omit<User, 'id' | 'password'>> = {};

    if (userData.role) {
        updateData.role = userData.role;
    }
    
    // In this app, we don't allow email updates from the user management screen
    // as it requires re-authentication and is a more complex flow.
    // If you need to update email, you'd implement a separate, secure function for it.

    if (Object.keys(updateData).length > 0) {
        await updateDoc(docRef, updateData);
    }
};

// Function to delete a user from Firestore. Deleting from Auth is a separate, privileged operation.
export const deleteUser = async (userId: string): Promise<void> => {
    // This only deletes the user's role document from Firestore.
    // It does NOT delete the user from Firebase Authentication.
    // Deleting a user from Auth is a destructive action and should be handled with care,
    // possibly through a backend function for security reasons.
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
};

export const getUsers = (callback: (users: User[]) => void): Unsubscribe => {
    const q = query(collection(db, USERS_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            // Do not show the main admin in the user management list
            if (doc.data().role !== 'adm') { 
                 users.push({ id: doc.id, ...doc.data() } as User);
            }
        });
        callback(users);
    });
    return unsubscribe;
};
