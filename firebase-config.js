import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyAwJrSpk0fTJZHIA56m77tYPSyb9-1BT6M",
  authDomain: "m3lomh-cyber.firebaseapp.com",
  projectId: "m3lomh-cyber",
  storageBucket: "m3lomh-cyber.firebasestorage.app",
  messagingSenderId: "1026943976292",
  appId: "1:1026943976292:web:e893cf599c9422f8d27071",
  measurementId: "G-8K3QZPXM56"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);