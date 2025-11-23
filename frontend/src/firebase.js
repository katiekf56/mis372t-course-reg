import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAGb2Co70tdk6cxt_esrY41npIPSQp9L34",
  authDomain: "mis372t-course-reg.firebaseapp.com",
  projectId: "mis372t-course-reg",
  storageBucket: "mis372t-course-reg.firebasestorage.app",
  messagingSenderId: "376849041182",
  appId: "1:376849041182:web:51a6c19a6c9723b64cab0f",
  measurementId: "G-HWWC6FR88JE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);