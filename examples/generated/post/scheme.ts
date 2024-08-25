import { DocumentReference, Timestamp } from "firebase/firestore";
import { User } from "../user/scheme";

export interface Post {
  title: string;
  content: string;
  publishedAt: Timestamp;
  body?: {
    images?: Array<string>;
    text: string;
  };
  tags?: Array<string>;
  likes: number;
  author: DocumentReference<User>;
}

export type Ref = (userDocId: string, postDocId?: string) => string;

export const postRef: Ref = (userDocId: string, postDocId?: string) =>
  `/users/${userDocId}/posts${postDocId ? `/${postDocId}` : ""}`;
