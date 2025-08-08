
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "controle-de-acesso-zd058",
  "appId": "1:760150993338:web:206cedb3fa7557c8029583",
  "storageBucket": "controle-de-acesso-zd058.firebasestorage.app",
  "apiKey": "AIzaSyALrLfhoIXcToFkwSWox6XDBOotwrDan94",
  "authDomain": "controle-de-acesso-zd058.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "760150993338"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
