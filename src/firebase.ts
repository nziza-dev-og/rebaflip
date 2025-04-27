import  { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBMEVzmAtxtrJ2hFihihCZNdoHJS2MvIk4",
  authDomain: "movies-show-e28ec.firebaseapp.com",
  projectId: "movies-show-e28ec",
  storageBucket: "movies-show-e28ec.firebasestorage.app",
  messagingSenderId: "784660749410",
  appId: "1:784660749410:web:94edf2d64231f8ed1a853b",
  measurementId: "G-EZ698C6RLB"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
 