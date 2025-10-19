import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCi52yXKcRMEDeELvzlPW-gL-MQ4EbX3sg",
  authDomain: "agrihackathondb.firebaseapp.com",
  projectId: "agrihackathondb",
  storageBucket: "agrihackathondb.firebasestorage.app",
  messagingSenderId: "194115173807",
  appId: "1:194115173807:web:fec2e0f6fdcbb324ffc35a",
  measurementId: "G-Y894JSPLYH"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;