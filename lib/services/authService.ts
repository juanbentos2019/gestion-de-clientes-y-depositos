import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  updatePassword,
  User as FirebaseUser,
  getAuth,
  initializeAuth
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User, UserRole } from '@/types';

export const authService = {
  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        return { id: firebaseUser.uid, ...userDoc.data() } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },

  // Create new user (Admin/Master only)
  async createUser(
    email: string, 
    password: string, 
    userData: Omit<User, 'id'>
  ): Promise<User> {
    try {
      // Verificar que hay un usuario logueado
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Debe estar logueado para crear usuarios');
      }
      
      // Crear una segunda instancia de Firebase para crear el usuario sin afectar la sesión actual
      const secondaryApp = initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
      }, 'Secondary');
      
      const secondaryAuth = getAuth(secondaryApp);
      
      // Crear el nuevo usuario con la instancia secundaria
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const firebaseUser = userCredential.user;
      
      const newUser: User = {
        id: firebaseUser.uid,
        ...userData,
        createdAt: Date.now()
      };
      
      // Guardar datos del nuevo usuario en Firestore (usando la BD principal)
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      
      // Cerrar sesión de la instancia secundaria y eliminarla
      await signOut(secondaryAuth);
      await secondaryApp.delete();
      
      // La sesión del usuario actual (MASTER) NO se ve afectada
      
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user password
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');
      
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  // Get current Firebase user
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }
};
