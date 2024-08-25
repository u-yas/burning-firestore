import { DocumentReference,Timestamp } from 'firebase/firestore';



export interface User {
	name: string;
	email: string;
	age?: number;
	isActive: boolean;
	createdAt: Timestamp;
	preferences?: {
    theme?: string;
    notifications?: boolean;
  };
}

export type Ref = (userDocId?: string) => string;

export const userRef: Ref = (userDocId?: string) => `/users${userDocId ? `/${userDocId}` : ''}`;
