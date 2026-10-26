// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEOFGCkXEbQgdYfsep6s6MEa0FvT4W3Ig",
  authDomain: "wix-o-dead-party-votaciones.firebaseapp.com",
  projectId: "wix-o-dead-party-votaciones",
  storageBucket: "wix-o-dead-party-votaciones.firebasestorage.app",
  messagingSenderId: "598781515354",
  appId: "1:598781515354:web:968383cdff2e589a1eaa63",
  measurementId: "G-STBF9LGM2W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Exportar la base de datos para usarla en los componentes
export const db = getFirestore(app);
