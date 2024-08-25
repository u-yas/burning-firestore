import { Firestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, QueryFieldFilterConstraint, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { Post, postRef, Ref } from './scheme';

// Collection reference
export const postCollection = (db: Firestore, ...params: Parameters<Ref>) => 
  collection(db, postRef(...params));

// Document reference
export const postDoc = (db: Firestore, ...params: Parameters<Ref>) => 
  doc(db, postRef(...params));

// Get a document
export const getPost = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = postDoc(db, ...params);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as Post : null;
};

// Get all documents in a collection
export const getAllPosts = async (db: Firestore, ...params: Parameters<Ref>) => {
  const collectionRef = postCollection(db, ...params);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map(doc => doc.data() as Post);
};

// Add a new document
export const addPost = async (db: Firestore, data: Post, ...params: Parameters<Ref>) => {
  const collectionRef = postCollection(db, ...params);
  return await addDoc(collectionRef, data);
};

// Set a document
export const setPost = async (db: Firestore, data: Post, ...params: Parameters<Ref>) => {
  const docRef = postDoc(db, ...params);
  await setDoc(docRef, data);
};

// Update a document
export const updatePost = async (db: Firestore, data: Partial<Post>, ...params: Parameters<Ref>) => {
  const docRef = postDoc(db, ...params);
  await updateDoc(docRef, data);
};

// Delete a document
export const deletePost = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = postDoc(db, ...params);
  await deleteDoc(docRef);
};

export const queryPosts = 
  (db: Firestore, ...refParams: Parameters<Ref>) =>
  async (...queries: QueryFieldFilterConstraint[]) => {
    const collectionRef = postCollection(db, ...refParams);
    const q = query(collectionRef, ...queries);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Post);
  };
