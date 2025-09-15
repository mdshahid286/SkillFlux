import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCFgGF33CfFeSVFdOVDmorsHhj2Y_Py-1E",
  authDomain: "skillflux-e432d.firebaseapp.com",
  projectId: "skillflux-e432d",
  storageBucket: "skillflux-e432d.appspot.com",
  messagingSenderId: "286753092890",
  appId: "1:286753092890:web:9b4b59c2fa6f92386928a3",
  measurementId: "G-6GVW1Z2C55"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
