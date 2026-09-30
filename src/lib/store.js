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

// Generic collection helpers (Firestore, with localStorage fallback)
const subscribe = (col, callback) => {
  if (useFirebase) {
    return onSnapshot(query(collection(db, col)), (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }
  callback(getLocal(col));
  const listener = () => callback(getLocal(col));
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
};

const add = async (col, data) => {
  if (useFirebase) return addDoc(collection(db, col), data);
  await delay(MOCK_DELAY);
  setLocal(col, [...getLocal(col), { id: Date.now().toString(), ...data }]);
  window.dispatchEvent(new Event('storage'));
};

const update = async (col, id, updates) => {
  if (useFirebase) return updateDoc(doc(db, col, id), updates);
  await delay(MOCK_DELAY);
  setLocal(col, getLocal(col).map(x => x.id === id ? { ...x, ...updates } : x));
  window.dispatchEvent(new Event('storage'));
};

const remove = async (col, id) => {
  if (useFirebase) return deleteDoc(doc(db, col, id));
  await delay(MOCK_DELAY);
  setLocal(col, getLocal(col).filter(x => x.id !== id));
  window.dispatchEvent(new Event('storage'));
};

export const subscribeToPlans = (cb) => subscribe("plans", cb);
export const createPlan = (data) => add("plans", data);
export const updatePlan = (id, updates) => update("plans", id, updates);
export const deletePlan = (id) => remove("plans", id);

// Banco global de ideas descartadas
export const subscribeToIdeas = (cb) => subscribe("ideas", cb);
export const addIdea = (data) => add("ideas", data);
export const deleteIdea = (id) => remove("ideas", id);

// Planes personales (cada uno los suyos, visibles en el calendario)
export const subscribeToPersonalPlans = (cb) => subscribe("personalPlans", cb);
export const createPersonalPlan = (data) => add("personalPlans", data);
export const deletePersonalPlan = (id) => remove("personalPlans", id);

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
