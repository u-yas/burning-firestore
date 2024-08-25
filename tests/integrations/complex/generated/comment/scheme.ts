import { DocumentReference,Timestamp } from 'firebase/firestore';
import { User } from '../user/scheme'


export interface Comment {
	content: string;
	createdAt: Timestamp;
	author: DocumentReference<User>;
	likes: number;
	isApproved: boolean;
	replies?: Array<{
    content: string;
    createdAt: Timestamp;
    author: DocumentReference<User>;
  }>;
}

export type Ref = (userDocId: string, postDocId: string, commentDocId?: string) => string;

export const commentRef: Ref = (userDocId: string, postDocId: string, commentDocId?: string) => `/users/${userDocId}/posts/${postDocId}/comments${commentDocId ? `/${commentDocId}` : ''}`;
