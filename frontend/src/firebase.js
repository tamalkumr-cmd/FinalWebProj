import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage"; // 👈 1. ADDED THIS IMPORT

const firebaseConfig = {
    apiKey: "AIzaSyB1WtazlA0xSCA8EBbXYmndo1I4yKWT2cs",
    authDomain: "mmmt-eac24.firebaseapp.com",
    projectId: "mmmt-eac24",
    storageBucket: "mmmt-eac24.firebasestorage.app",
    messagingSenderId: "988398097514",
    appId: "1:988398097514:web:583488d5d376960338a613",
    measurementId: "G-1E8238X10S",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app); // 👈 2. EXPORTED STORAGE HERE