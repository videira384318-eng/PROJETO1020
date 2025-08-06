// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "SECRET_API_KEY",
  authDomain: "sturdy-webbing-428615-h3.firebaseapp.com",
  projectId: "sturdy-webbing-428615-h3",
  storageBucket: "sturdy-webbing-428615-h3.appspot.com",
  messagingSenderId: "565500694195",
  appId: "1:565500694195:web:d23a49257d819665f80cd3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
