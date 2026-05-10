import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADcw66gKxiC5BqJQoQ_0cyQ0TOvKFuLn8",
  authDomain: "travio-44a1b.firebaseapp.com",
  projectId: "travio-44a1b",
  storageBucket: "travio-44a1b.firebasestorage.app",
  messagingSenderId: "161651340859",
  appId: "1:161651340859:web:5550daa3a45d7f14540e1e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
