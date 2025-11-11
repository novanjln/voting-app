// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "API_KEY_KAMU",
  authDomain: "NAMA_PROJECT.firebaseapp.com",
  projectId: "NAMA_PROJECT",
  storageBucket: "NAMA_PROJECT.appspot.com",
  messagingSenderId: "ANGKA_PENGIRIM",
  appId: "APP_ID_KAMU"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
