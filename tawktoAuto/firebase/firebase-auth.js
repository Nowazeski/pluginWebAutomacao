// ===============================
// firebase/firebase-auth.js
// ===============================

// Importa os métodos necessários da SDK Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Exporta todos para uso no popup.js
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
};
