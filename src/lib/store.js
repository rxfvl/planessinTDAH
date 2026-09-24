import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, query, onSnapshot } from "firebase/firestore";

// REPLACE THESE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDaIG8iJSVarpAKZtsvc0dQIOQ-JVebyrk",
  authDomain: "planesnotdah.firebaseapp.com",
  projectId: "planesnotdah",
  storageBucket: "planesnotdah.firebasestorage.app",
  messagingSenderId: "82359582119",
  appId: "1:82359582119:web:920128d81746af4dfd8a82",
  measurementId: "G-XF6BD0HD3V"
};

let app, db;
let useFirebase = false;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  useFirebase = true;
}

// Fallback to LocalStorage for immediate demo
const MOCK_DELAY = 300;
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const getLocal = (key) => JSON.parse(localStorage.getItem(key)) || [];
const setLocal = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const subscribeToPlans = (callback) => {
  if (useFirebase) {
    const q = query(collection(db, "plans"));
    return onSnapshot(q, (snapshot) => {
      const plans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(plans);
    });
  } else {
    // Local storage mock
    callback(getLocal("plans"));
    // Reactivity for mock across tabs
    const listener = () => callback(getLocal("plans"));
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }
};

export const createPlan = async (planData) => {
  if (useFirebase) {
    await addDoc(collection(db, "plans"), planData);
  } else {
    await delay(MOCK_DELAY);
    const plans = getLocal("plans");
    const newPlan = { id: Date.now().toString(), ...planData };
    setLocal("plans", [...plans, newPlan]);
    window.dispatchEvent(new Event('storage'));
    return newPlan;
  }
};

export const updatePlan = async (planId, updates) => {
  if (useFirebase) {
    const planRef = doc(db, "plans", planId);
    await updateDoc(planRef, updates);
  } else {
    await delay(MOCK_DELAY);
    let plans = getLocal("plans");
    plans = plans.map(p => p.id === planId ? { ...p, ...updates } : p);
    setLocal("plans", plans);
    window.dispatchEvent(new Event('storage'));
  }
};

export const deletePlan = async (planId) => {
  if (useFirebase) {
    await deleteDoc(doc(db, "plans", planId));
  } else {
    await delay(MOCK_DELAY);
    let plans = getLocal("plans");
    plans = plans.filter(p => p.id !== planId);
    setLocal("plans", plans);
    window.dispatchEvent(new Event('storage'));
  }
};

// Auth replaced by simple LocalStorage identity
export const setIdentity = (userName) => {
  const user = { uid: userName, displayName: userName };
  localStorage.setItem("appUser", JSON.stringify(user));
  window.dispatchEvent(new Event('auth_change'));
  return user;
};

export const logoutIdentity = () => {
  localStorage.removeItem("appUser");
  window.dispatchEvent(new Event('auth_change'));
};

export const listenToIdentity = (callback) => {
  const checkUser = () => {
    const user = JSON.parse(localStorage.getItem("appUser"));
    callback(user);
  };
  checkUser();
  window.addEventListener('auth_change', checkUser);
  return () => window.removeEventListener('auth_change', checkUser);
};
