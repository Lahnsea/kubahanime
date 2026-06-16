/**
 * Firebase Configuration — Kubamanga
 * 
 * Cara setup:
 * 1. Buka https://console.firebase.google.com/
 * 2. Buat project baru → "Kubamanga"
 * 3. Tambahkan Web App
 * 4. Copy firebaseConfig dan paste di sini
 * 5. Di Firebase Console:
 *    - Authentication → Sign-in method → aktifkan Google + Email/Password
 *    - Firestore Database → Create database (production mode)
 *    - Firestore Rules → set sesuai template di bawah
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ⚠️ GANTI dengan config Firebase project kamu atau gunakan .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

export const isFirebaseMocked = !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY";

/*
 * Firestore Security Rules (paste di Firebase Console → Firestore → Rules):
 *
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /users/{userId}/{document=**} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *   }
 * }
 */

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
