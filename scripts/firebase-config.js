// scripts/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCrGcoLW3tEtrFGlNnX7NIbd1RfOOhaVwY",
  authDomain: "sdf1-34631.firebaseapp.com",
  projectId: "sdf1-34631",
  storageBucket: "sdf1-34631.firebasestorage.app",
  messagingSenderId: "122107622167",
  appId: "1:122107622167:web:ad96d0f60b14b80de17d52",
  measurementId: "G-VFP8YSFFC1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db };
