import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  and
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DepositReceipt } from '@/types';

const DEPOSIT_RECEIPTS_COLLECTION = 'depositReceipts';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingReceipt?: DepositReceipt;
}

export const depositReceiptService = {
  // Check if operation number already exists for the same bank (FRAUD DETECTION)
  async checkDuplicateOperation(
    bank: string, 
    operationNumber: string,
    excludeReceiptId?: string
  ): Promise<DuplicateCheckResult> {
    try {
      const q = query(
        collection(db, DEPOSIT_RECEIPTS_COLLECTION),
        where('bank', '==', bank),
        where('operationNumber', '==', operationNumber)
      );
      
      const querySnapshot = await getDocs(q);
      
      // If excluding a receipt (for updates), filter it out
      const duplicates = querySnapshot.docs
        .filter(doc => !excludeReceiptId || doc.id !== excludeReceiptId)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DepositReceipt));
      
      if (duplicates.length > 0) {
        return {
          isDuplicate: true,
          existingReceipt: duplicates[0]
        };
      }
      
      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking duplicate operation:', error);
      throw error;
    }
  },

  // Get all deposit receipts
  async getAllDepositReceipts(): Promise<DepositReceipt[]> {
    try {
      const q = query(
        collection(db, DEPOSIT_RECEIPTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DepositReceipt));
    } catch (error) {
      console.error('Error getting deposit receipts:', error);
      throw error;
    }
  },

  // Get deposit receipts by branch
  async getDepositReceiptsByBranch(branchId: string): Promise<DepositReceipt[]> {
    try {
      const q = query(
        collection(db, DEPOSIT_RECEIPTS_COLLECTION),
        where('branchId', '==', branchId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DepositReceipt));
    } catch (error) {
      console.error('Error getting deposit receipts by branch:', error);
      throw error;
    }
  },

  // Get deposit receipts by bank
  async getDepositReceiptsByBank(bank: string): Promise<DepositReceipt[]> {
    try {
      const q = query(
        collection(db, DEPOSIT_RECEIPTS_COLLECTION),
        where('bank', '==', bank),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DepositReceipt));
    } catch (error) {
      console.error('Error getting deposit receipts by bank:', error);
      throw error;
    }
  },

  // Get single deposit receipt
  async getDepositReceipt(receiptId: string): Promise<DepositReceipt | null> {
    try {
      const docRef = doc(db, DEPOSIT_RECEIPTS_COLLECTION, receiptId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DepositReceipt;
      }
      return null;
    } catch (error) {
      console.error('Error getting deposit receipt:', error);
      throw error;
    }
  },

  // Add new deposit receipt (with duplicate check)
  async addDepositReceipt(receipt: Omit<DepositReceipt, 'id'>): Promise<string> {
    try {
      // First, check for duplicates
      const duplicateCheck = await this.checkDuplicateOperation(
        receipt.bank,
        receipt.operationNumber
      );
      
      if (duplicateCheck.isDuplicate) {
        throw new Error(
          `⚠️ ALERTA DE FRAUDE: El número de operación "${receipt.operationNumber}" ` +
          `ya existe para el banco "${receipt.bank}". ` +
          `Registrado el ${new Date(duplicateCheck.existingReceipt!.createdAt).toLocaleString()} ` +
          `por ${duplicateCheck.existingReceipt!.clientName}.`
        );
      }
      
      const docRef = await addDoc(collection(db, DEPOSIT_RECEIPTS_COLLECTION), {
        ...receipt,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding deposit receipt:', error);
      throw error;
    }
  },

  // Update deposit receipt (with duplicate check)
  async updateDepositReceipt(
    receiptId: string, 
    receipt: Partial<DepositReceipt>
  ): Promise<void> {
    try {
      // If updating operation number or bank, check for duplicates
      if (receipt.operationNumber || receipt.bank) {
        const existing = await this.getDepositReceipt(receiptId);
        if (!existing) throw new Error('Receipt not found');
        
        const bankToCheck = receipt.bank || existing.bank;
        const opNumberToCheck = receipt.operationNumber || existing.operationNumber;
        
        const duplicateCheck = await this.checkDuplicateOperation(
          bankToCheck,
          opNumberToCheck,
          receiptId // Exclude current receipt from check
        );
        
        if (duplicateCheck.isDuplicate) {
          throw new Error(
            `⚠️ ALERTA DE FRAUDE: El número de operación "${opNumberToCheck}" ` +
            `ya existe para el banco "${bankToCheck}".`
          );
        }
      }
      
      const docRef = doc(db, DEPOSIT_RECEIPTS_COLLECTION, receiptId);
      await updateDoc(docRef, receipt);
    } catch (error) {
      console.error('Error updating deposit receipt:', error);
      throw error;
    }
  },

  // Delete deposit receipt
  async deleteDepositReceipt(receiptId: string): Promise<void> {
    try {
      const docRef = doc(db, DEPOSIT_RECEIPTS_COLLECTION, receiptId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting deposit receipt:', error);
      throw error;
    }
  },

  // Search deposit receipts
  async searchDepositReceipts(searchTerm: string): Promise<DepositReceipt[]> {
    try {
      const allReceipts = await this.getAllDepositReceipts();
      const term = searchTerm.toLowerCase();
      
      return allReceipts.filter(receipt => 
        receipt.clientName.toLowerCase().includes(term) ||
        receipt.bank.toLowerCase().includes(term) ||
        receipt.operationNumber.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching deposit receipts:', error);
      throw error;
    }
  }
};
