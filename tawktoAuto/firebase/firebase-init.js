// ===============================
// firebase/firebase-init.js
// ===============================

// Importa os módulos necessários do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCjeJ9e-aXV-OO7TbDeEFND19XGWefu1lI",
  authDomain: "tawkchat-7a5b4.firebaseapp.com",
  projectId: "tawkchat-7a5b4",
  storageBucket: "tawkchat-7a5b4.firebasestorage.app",
  messagingSenderId: "816237368657",
  appId: "1:816237368657:web:41c225f78494f882f0af70",
  measurementId: "G-DQ69NGVDWV"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços principais
export const auth = getAuth(app);
export const db = getFirestore(app);
