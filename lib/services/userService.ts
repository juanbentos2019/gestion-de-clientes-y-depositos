import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '@/types';

const USERS_COLLECTION = 'users';

export const userService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        orderBy('username', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get single user
  async getUser(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Get users by branch
  async getUsersByBranch(branchId: string): Promise<User[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('branchId', '==', branchId),
        orderBy('username', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error getting users by branch:', error);
      throw error;
    }
  },

  // Add/Update user (used after Firebase Auth creates the user)
  async setUser(userId: string, userData: Omit<User, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await setDoc(docRef, {
        ...userData,
        createdAt: userData.createdAt || Date.now()
      });
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(docRef, userData);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    try {
      const docRef = doc(db, USERS_COLLECTION, userId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};
