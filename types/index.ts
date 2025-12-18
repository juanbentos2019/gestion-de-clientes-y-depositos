export type UserRole = 'MASTER' | 'ADMIN' | 'USER';

export type ClientStatus = 'PENDING' | 'CONTACTED' | 'COMPLETED' | 'CANCELLED';

export type CurrencyType = 'USD' | 'EUR' | 'ARS' | 'BRL' | 'OTHER';

export interface Branch {
  id: string;
  name: string;
  createdAt?: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  branchId?: string; // Optional for Master/Admin, required for User
  createdAt?: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  landline?: string;
  mobile: string;
  address?: string;
  email?: string;
  interestType?: string;
  investmentAmount?: number;
  branchId: string; // References Branch.id
  status: ClientStatus;
  createdBy: string; // User ID who created this client
  createdAt: number;
  updatedAt?: number;
}

export interface DepositReceipt {
  id: string;
  clientName: string; // Can be from existing client or manual entry
  clientId?: string; // Optional reference to Client.id
  bank: string; // Bank name where deposit was made
  depositAmount: number; // Amount deposited
  depositCurrency: CurrencyType; // Currency of the deposit
  operationNumber: string; // Unique operation number (must be unique per bank)
  counterpartyCurrency: CurrencyType; // Currency bought/sold (e.g., if deposited ARS, bought USD)
  branchId: string; // Branch where this was registered
  createdBy: string; // User ID who created this receipt
  createdAt: number;
  notes?: string; // Optional notes
}

export interface ClientFormData {
  firstName: string;
  lastName: string;
  landline: string;
  mobile: string;
  address: string;
  email: string;
  interestType: string;
  investmentAmount: string;
  branchId: string;
  status: ClientStatus;
}

export interface DepositReceiptFormData {
  clientName: string;
  clientId: string;
  bank: string;
  depositAmount: string;
  depositCurrency: CurrencyType;
  operationNumber: string;
  counterpartyCurrency: CurrencyType;
  notes: string;
}

export type SortField = 'lastName' | 'createdAt' | 'investmentAmount';
export type SortOrder = 'asc' | 'desc';

// Firebase related types
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
