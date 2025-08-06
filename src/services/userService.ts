
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
    getDocs,
    where
} from 'firebase/firestore';
import type { Role } from '@/contexts/auth-context';
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    fetchSignInMethodsForEmail 
} from "firebase/auth";


export interface User {
    id: string; // This will be the UID from Firebase Auth
    email: string;
    password?: string; // Only used for creation, not stored in Firestore
    role: Role;
}

const USERS_COLLECTION = 'users'; // This collection stores user roles and other data
const auth = getAuth();


// Creates the initial admin user if they don't exist
const createInitialAdmin = async () => {
    const adminEmail = "adm@empresa.com";
    const adminUID = "initial_admin_uid"; // A consistent, predictable UID for lookup

    // Check if the admin role document already exists in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, adminUID);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
        console.log("Admin user role not found in Firestore, creating...");
        try {
            // Check if an auth user with this email exists.
            const methods = await fetchSignInMethodsForEmail(auth, adminEmail);
            if (methods.length === 0) {
                 console.log("No Firebase Auth user for admin, creating...");
                 // This is a placeholder for creation. In a real app, you'd create this user
                 // through the Firebase Console or a secure script.
                 // We cannot create a user with a fixed UID from the client-side SDK.
                 // For this simulation, we'll just set the role document.
                 console.log("ACTION REQUIRED: Manually create a Firebase Auth user with email 'adm@empresa.com' and set a password. Then, find their UID in the console and update the 'adminUID' constant in userService.ts to match it. For now, we will create a placeholder document.");
            }
             await setDoc(userDocRef, {
                email: adminEmail,
                role: 'adm'
            });
            console.log("Admin user role created in Firestore.");
        } catch (error) {
            console.error("Error creating initial admin user:", error);
        }
    }
};

// Call this once, perhaps in a layout or provider.
// For now, we'll let it be called on first use.
// createInitialAdmin();


export const getUserRole = async (uid: string): Promise<Role | null> => {
    // Special check for the initial admin, in case their document needs to be created.
    if (uid === "initial_admin_uid") {
        await createInitialAdmin();
    }
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return (docSnap.data() as User).role;
    }
    return null;
}

// Function to add a user in Auth and Firestore
export const addUser = async (userData: Omit<User, 'id'>): Promise<string> => {
    if (!userData.password) {
        throw new Error("Password is required to create a user.");
    }
    
    // Step 1: Create user in Firebase Authentication
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
    
    if (Object.keys(updateData).length > 0) {
        await updateDoc(docRef, updateData);
    }
     // Note: Updating email or password in Firebase Auth requires separate, secure flows
     // and is not handled here for simplicity.
};

// Function to delete a user from Firestore. Deleting from Auth is a separate, privileged operation.
export const deleteUser = async (userId: string): Promise<void> => {
    // This only deletes the user's role document from Firestore.
    // It does NOT delete the user from Firebase Authentication.
    // Deleting a user from Auth is a destructive action and should be handled with care,
    // possibly through a backend function.
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
};

export const getUsers = (callback: (users: User[]) => void): Unsubscribe => {
    const q = query(collection(db, USERS_COLLECTION));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().role !== 'adm') { // Don't show admin in user management list
                 users.push({ id: doc.id, ...doc.data() } as User);
            }
        });
        callback(users);
    });
    return unsubscribe;
};
