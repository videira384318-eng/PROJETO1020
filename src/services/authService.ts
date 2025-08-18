
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

// Helper function to get or create a user profile
const getOrCreateUserProfile = async (user: User): Promise<UserProfile> => {
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
    } else {
        // If profile doesn't exist, create a default one with 'portaria' role
        console.warn("Nenhum perfil de usuário encontrado para o UID:", user.uid, "Criando um perfil padrão.");
        const defaultProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            role: 'portaria', // Assign a default, least-privileged role
            permissions: [],
        };
        try {
            await setDoc(userDocRef, defaultProfile);
            return defaultProfile;
        } catch (error) {
            console.error("Falha ao criar o perfil de usuário padrão:", error);
            // Return a temporary profile object to avoid breaking the app
            return { ...defaultProfile, role: 'portaria' }; 
        }
    }
};

export const signUpUser = async (email: string, password: string, role: UserProfile['role']): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user profile document in Firestore
    const userDocRef = doc(db, USERS_COLLECTION, user.uid);
    await setDoc(userDocRef, { 
        uid: user.uid,
        email: user.email,
        role: role,
        permissions: []
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
            // User is signed in, get their profile
            const profile = await getOrCreateUserProfile(user);
            callback(user, profile);
        } else {
            // User is signed out
            callback(null, null);
        }
    });
};


export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};
