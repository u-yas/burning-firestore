import { DocumentReference, Timestamp } from "firebase/firestore";

export type User = {
  name: string;
  email: string;
  info: {
    age: number;
    sex: "men" | "female";
  };
  ref: DocumentReference<{ n: string }>;
  tstamp: Timestamp;
};
