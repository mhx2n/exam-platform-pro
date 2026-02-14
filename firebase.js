import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAGg5aZ9dSlfMqIReuumDk3QlkJtC-880I",
  authDomain: "csv-exam-system-9e643.firebaseapp.com",
  projectId: "csv-exam-system-9e643",
  storageBucket: "csv-exam-system-9e643.firebasestorage.app",
  messagingSenderId: "243008760655",
  appId: "1:243008760655:web:42f168ee0b75da6234333a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
