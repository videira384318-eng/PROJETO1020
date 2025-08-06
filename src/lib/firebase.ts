"use client";

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "SECRET_API_KEY",
  authDomain: "fir-studiogpt-test-project.firebaseapp.com",
  projectId: "fir-studiogpt-test-project",
  storageBucket: "fir-studiogpt-test-project.appspot.com",
  messagingSenderId: "362141527833",
  appId: "1:362141527833:web:20f8c8188151287c88b907",
  measurementId: "G-1WJ2PZ053S"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db = getFirestore(app);

export { app, db };