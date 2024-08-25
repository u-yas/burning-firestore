import { Firestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, QueryFieldFilterConstraint, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { User, userRef, Ref } from './scheme';

// Collection reference
export const userCollection = (db: Firestore, ...params: Parameters<Ref>) => 
  collection(db, userRef(...params));

// Document reference
export const userDoc = (db: Firestore, ...params: Parameters<Ref>) => 
  doc(db, userRef(...params));

// Get a document
export const getUser = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = userDoc(db, ...params);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as User : null;
};

// Get all documents in a collection
export const getAllUsers = async (db: Firestore, ...params: Parameters<Ref>) => {
  const collectionRef = userCollection(db, ...params);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map(doc => doc.data() as User);
};

// Add a new document
export const addUser = async (db: Firestore, data: User, ...params: Parameters<Ref>) => {
  const collectionRef = userCollection(db, ...params);
  return await addDoc(collectionRef, data);
};

// Set a document
export const setUser = async (db: Firestore, data: User, ...params: Parameters<Ref>) => {
  const docRef = userDoc(db, ...params);
  await setDoc(docRef, data);
};

// Update a document
export const updateUser = async (db: Firestore, data: Partial<User>, ...params: Parameters<Ref>) => {
  const docRef = userDoc(db, ...params);
  await updateDoc(docRef, data);
};

// Delete a document
export const deleteUser = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = userDoc(db, ...params);
  await deleteDoc(docRef);
};

export const queryUsers = 
  (db: Firestore, ...refParams: Parameters<Ref>) =>
  async (...queries: QueryFieldFilterConstraint[]) => {
    const collectionRef = userCollection(db, ...refParams);
    const q = query(collectionRef, ...queries);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as User);
  };
