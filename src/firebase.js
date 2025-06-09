// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACq9bl0jhyXKV4IRKcc74ZpCUQrOJ7mI4",
  authDomain: "testlobstersuhardi.firebaseapp.com",
  databaseURL: "https://testlobstersuhardi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "testlobstersuhardi",
  storageBucket: "testlobstersuhardi.firebasestorage.app",
  messagingSenderId: "764508340777",
  appId: "1:764508340777:web:62d60404217ecad1fad238"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

// Initialize Firebase Authentication
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Export the database and authentication objects so they can be used in other components
export { database, auth, provider };