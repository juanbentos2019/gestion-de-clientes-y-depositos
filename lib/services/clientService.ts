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
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Client } from '@/types';

const CLIENTS_COLLECTION = 'clients';

export const clientService = {
  // Get all clients
  async getAllClients(): Promise<Client[]> {
    try {
      const q = query(
        collection(db, CLIENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  },

  // Get clients by branch
  async getClientsByBranch(branchId: string): Promise<Client[]> {
    try {
      const q = query(
        collection(db, CLIENTS_COLLECTION),
        where('branchId', '==', branchId)
      );
      const querySnapshot = await getDocs(q);
      const clients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
      
      // Ordenar en cliente para evitar necesidad de índice compuesto
      return clients.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (error) {
      console.error('Error getting clients by branch:', error);
      throw error;
    }
  },

  // Get single client
  async getClient(clientId: string): Promise<Client | null> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, clientId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Client;
      }
      return null;
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  },

  // Add new client
  async addClient(client: Omit<Client, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
        ...client,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  // Update client
  async updateClient(clientId: string, client: Partial<Client>): Promise<void> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, clientId);
      await updateDoc(docRef, {
        ...client,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete client
  async deleteClient(clientId: string): Promise<void> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, clientId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Search clients by name
  async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      const allClients = await this.getAllClients();
      const term = searchTerm.toLowerCase();
      
      return allClients.filter(client => 
        client.firstName.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.mobile.includes(term) ||
        (client.email && client.email.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }
};
