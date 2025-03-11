// scripts/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Firebase configuration
// NOTA: En un entorno de producción, estas credenciales deberían estar en variables de entorno
const firebaseConfig = {
  apiKey: "AIzaSyCrGcoLW3tEtrFGlNnX7NIbd1RfOOhaVwY",
  authDomain: "sdf1-34631.firebaseapp.com",
  projectId: "sdf1-34631",
  storageBucket: "sdf1-34631.appspot.com",
  messagingSenderId: "122107622167",
  appId: "1:122107622167:web:ad96d0f60b14b80de17d52",
  measurementId: "G-VFP8YSFFC1"
};

// Inicialización con manejo de errores
let app, db, analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  analytics = getAnalytics(app);
  console.log("Firebase inicializado correctamente");
} catch (error) {
  console.error("Error al inicializar Firebase:", error);
  alert("Error al conectar con la base de datos. Algunas funciones pueden no estar disponibles.");
}

export { db };
