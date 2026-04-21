import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbG8Eecm3Gv9F_SnrwilyjE3DY68_BFR8",
  authDomain: "nexus-login-b47f9.firebaseapp.com",
  projectId: "nexus-login-b47f9",
  storageBucket: "nexus-login-b47f9.firebasestorage.app",
  messagingSenderId: "384954560468",
  appId: "1:384954560468:web:57e834ffeb0e01fbee7041",
  measurementId: "G-WREJMCPX81"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);