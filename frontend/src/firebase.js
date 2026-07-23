import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCBQKtQsHVsvSLghQHfqnaVLi4928MQ7zg",
  authDomain: "auditmind-567d6.firebaseapp.com",
  projectId: "auditmind-567d6",
  storageBucket: "auditmind-567d6.firebasestorage.app",
  messagingSenderId: "415810622981",
  appId: "1:415810622981:web:258ea9e8fa24fe92e66e6c",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);