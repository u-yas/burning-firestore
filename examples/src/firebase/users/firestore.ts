import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  QueryFieldFilterConstraint,
  setDoc,
} from "firebase/firestore";
import { UserValidator, User } from "./schema";
import { parse } from "valibot";

export const collectionPath = "user";

export const userCollection = (db: Firestore) =>
  collection(db, collectionPath).withConverter<User, User>({
    toFirestore: (user) => parse(UserValidator, user),
    fromFirestore: (snapshot, options) => {
      const data = parse(UserValidator, snapshot.data(options));
      return data;
    },
  });

export const getUser = async (db: Firestore, id: string) => {
  const user = await getDoc(doc(userCollection(db), id));
  return user;
};

export const queryUser = async (
  db: Firestore,
  ...queries: QueryFieldFilterConstraint[]
) => {
  const q = query(userCollection(db), ...queries);
  const docs = await getDocs(q);
  return docs;
};

export const addUser = async (db: Firestore, user: User) => {
  return await addDoc(userCollection(db), user);
};

export const setUser = async (db: Firestore, id: string, user: User) => {
  return await setDoc(doc(userCollection(db), id), user);
};
