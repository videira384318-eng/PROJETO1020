
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    type User
} from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { app, db } from '@/lib/firebase';
import type { UserProfile } from "@/types";

const auth = getAuth(app);
const USERS_COLLECTION = 'usuarios';

export const signUpUser = async (email: string, password: string, role: 'adm' | 'rh' | 'portaria' | 'supervisao'): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user profile document in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(userDocRef, { 
        uid: user.uid,
        email: user.email,
        role: role,
        permissions: [] // Add default permissions based on role if needed
     });

    return user;
};

export const signInUser = (email: string, password: string): Promise<any> => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = (): Promise<void> => {
    return signOut(auth);
};

export const onAuthUserStateChanged = (callback: (user: User | null, profile: UserProfile | null) => void) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in, get their profile from Firestore
            const userDocRef = doc(db, USERS_COLLECTION, user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                callback(user, docSnap.data() as UserProfile);
            } else {
                // Profile doesn't exist, something is wrong
                console.error("No user profile found for UID:", user.uid);
                callback(user, null);
            }
        } else {
            // User is signed out
            callback(null, null);
        }
    });
};

export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};
