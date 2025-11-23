// src/firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// !!! สำคัญ: แทนที่ข้อมูลด้านล่างนี้ด้วย Firebase Config ของคุณเอง !!!
const firebaseConfig = {
  apiKey: "AIzaSyBZvfLNEHYBK-DKcsGdFOenFwLZJMxS7iY",
  authDomain: "kaitodhatyai-504f8.firebaseapp.com",
  projectId: "kaitodhatyai-504f8",
  storageBucket: "kaitodhatyai-504f8.firebasestorage.app",
  messagingSenderId: "395846897458",
  appId: "1:395846897458:web:a6b8a2588035fee7bd512b",
  measurementId: "G-VWSFMY3S5Q"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export Firestore instance
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { Timestamp };