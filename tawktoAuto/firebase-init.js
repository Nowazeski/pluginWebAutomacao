// firebase-init.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjeJ9e-aXV-OO7TbDeEFND19XGWefu1lI",
  authDomain: "tawkchat-7a5b4.firebaseapp.com",
  projectId: "tawkchat-7a5b4",
  storageBucket: "tawkchat-7a5b4.appspot.com",
  messagingSenderId: "816237368657",
  appId: "1:816237368657:web:41c225f78494f882f0af70",
  measurementId: "G-DQ69NGVDWV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
