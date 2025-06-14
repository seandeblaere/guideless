import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  AuthError,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { SignInFormData, SignUpFormData } from '@/validation/validationSchemas';
import { getAuthErrorMessage } from '@/helpers/getAuthErrorMessage';
import { useRouteStore } from './RouteStore';

interface AuthActions {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
  initialize: () => () => void;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  actions: AuthActions;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,
  actions: {
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setInitialized: (isInitialized) => set({ isInitialized }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  signIn: async (data: SignInFormData) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password); 
    } catch (error: any) {
      const err = error as AuthError;
      const message = getAuthErrorMessage(err);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (data: SignUpFormData) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: data.firstName,
        });
        
        await sendEmailVerification(userCredential.user);
      }
    } catch (error: any) {
      const err = error as AuthError;
      const message = getAuthErrorMessage(err);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await signOut(auth);
      
    } catch (error: any) {
      const err = error as AuthError;
      const message = getAuthErrorMessage(err);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserProfile: async (displayName: string) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');
    
    set({ isLoading: true, error: null });
    try {
      await updateProfile(user, { displayName });
      await user.reload();
      set({ user: auth.currentUser });
    } catch (error: any) {
      const err = error as AuthError;
      const message = getAuthErrorMessage(err);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  sendPasswordReset: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      const err = error as AuthError;
      const message = getAuthErrorMessage(err);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  resendEmailVerification: async () => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');
    
    set({ isLoading: true, error: null });
    try {
      await sendEmailVerification(user);
    } catch (error: any) {
      const err = error as AuthError;
      const message = getAuthErrorMessage(err);
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: () => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if(!user) {
        useRouteStore.getState().actions.onAuthStateChanged();
      }
      set({ 
        user, 
        isInitialized: true,
        isLoading: false 
      });
    });
    
    return unsubscribe;
  },
  }
}));

export const useUser = () => useAuthStore((state) => state.user);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useIsInitialized = () => useAuthStore((state) => state.isInitialized);
export const useError = () => useAuthStore((state) => state.error);
export const useAuthActions = () => useAuthStore((state) => state.actions);
