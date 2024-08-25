import { Firestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, QueryFieldFilterConstraint, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { Comment, commentRef, Ref } from './scheme';

// Collection reference
export const commentCollection = (db: Firestore, ...params: Parameters<Ref>) => 
  collection(db, commentRef(...params));

// Document reference
export const commentDoc = (db: Firestore, ...params: Parameters<Ref>) => 
  doc(db, commentRef(...params));

// Get a document
export const getComment = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = commentDoc(db, ...params);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as Comment : null;
};

// Get all documents in a collection
export const getAllComments = async (db: Firestore, ...params: Parameters<Ref>) => {
  const collectionRef = commentCollection(db, ...params);
  const querySnapshot = await getDocs(collectionRef);
  return querySnapshot.docs.map(doc => doc.data() as Comment);
};

// Add a new document
export const addComment = async (db: Firestore, data: Comment, ...params: Parameters<Ref>) => {
  const collectionRef = commentCollection(db, ...params);
  return await addDoc(collectionRef, data);
};

// Set a document
export const setComment = async (db: Firestore, data: Comment, ...params: Parameters<Ref>) => {
  const docRef = commentDoc(db, ...params);
  await setDoc(docRef, data);
};

// Update a document
export const updateComment = async (db: Firestore, data: Partial<Comment>, ...params: Parameters<Ref>) => {
  const docRef = commentDoc(db, ...params);
  await updateDoc(docRef, data);
};

// Delete a document
export const deleteComment = async (db: Firestore, ...params: Parameters<Ref>) => {
  const docRef = commentDoc(db, ...params);
  await deleteDoc(docRef);
};

export const queryComments = 
  (db: Firestore, ...refParams: Parameters<Ref>) =>
  async (...queries: QueryFieldFilterConstraint[]) => {
    const collectionRef = commentCollection(db, ...refParams);
    const q = query(collectionRef, ...queries);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Comment);
  };
