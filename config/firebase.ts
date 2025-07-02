// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2kx8pdg-8ma2wowYNiWIySIAHcbnmFOY",
  authDomain: "expense-tracker-d27d7.firebaseapp.com",
  projectId: "expense-tracker-d27d7",
  storageBucket: "expense-tracker-d27d7.firebasestorage.app",
  messagingSenderId: "541555848662",
  appId: "1:541555848662:web:99e67f34f471ad9e006077"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//auth
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

//db
export const firestore = getFirestore(app);