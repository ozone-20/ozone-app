// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "ozone-fit.firebaseapp.com",
    projectId: "ozone-fit",
    storageBucket: "ozone-fit.firebasestorage.app",
    messagingSenderId: "758947673351",
    appId: "1:758947673351:web:9b075e7439305e83c541a2"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);