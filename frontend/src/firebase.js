// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqtcmL-w6Nm7Bz7SxjBNQ1_0DrgmopLRE",
  authDomain: "v3-h-6fb13.firebaseapp.com",
  projectId: "v3-h-6fb13",
  storageBucket: "v3-h-6fb13.firebasestorage.app",
  messagingSenderId: "544845541900",
  appId: "1:544845541900:web:257cfcb259d377355f7429",
  measurementId: "G-HMFYMGMG32"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);