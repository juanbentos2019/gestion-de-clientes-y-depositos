import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Branch } from '@/types';

const BRANCHES_COLLECTION = 'branches';

export const branchService = {
  // Get all branches
  async getAllBranches(): Promise<Branch[]> {
    try {
      const q = query(
        collection(db, BRANCHES_COLLECTION),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Branch));
    } catch (error) {
      console.error('Error getting branches:', error);
      throw error;
    }
  },

  // Get single branch
  async getBranch(branchId: string): Promise<Branch | null> {
    try {
      const docRef = doc(db, BRANCHES_COLLECTION, branchId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Branch;
      }
      return null;
    } catch (error) {
      console.error('Error getting branch:', error);
      throw error;
    }
  },

  // Add new branch
  async addBranch(branch: Omit<Branch, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, BRANCHES_COLLECTION), {
        ...branch,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding branch:', error);
      throw error;
    }
  },

  // Update branch
  async updateBranch(branchId: string, branch: Partial<Branch>): Promise<void> {
    try {
      const docRef = doc(db, BRANCHES_COLLECTION, branchId);
      await updateDoc(docRef, branch);
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  },

  // Delete branch
  async deleteBranch(branchId: string): Promise<void> {
    try {
      const docRef = doc(db, BRANCHES_COLLECTION, branchId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  }
};
