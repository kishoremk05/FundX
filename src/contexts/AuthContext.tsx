import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Profile } from '@/lib/database.types';

// Mock session interface to maintain compatibility if possible, or remove if unused elsewhere
interface Session {
  user: FirebaseUser;
  access_token: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  profileError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  isAdmin: boolean;
  isCustomer: boolean;
  isLoanOfficer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setSession({ user: firebaseUser, access_token: token });
        fetchProfile(firebaseUser.uid);
      } else {
        setSession(null);
        setProfile(null);
        setProfileError(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setProfileError(null);
      const docRef = doc(db, 'profiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      } else {
        console.log('No profile found for user:', userId, '- Creating default profile');
        // Auto-create default profile for existing auth users (migration support)
        const defaultProfile: Profile = {
          id: userId,
          email: auth.currentUser?.email || '',
          full_name: auth.currentUser?.displayName || 'User',
          phone: null,
          role: 'customer',
          avatar_url: auth.currentUser?.photoURL || null,
          branch_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await setDoc(docRef, defaultProfile);
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
      setProfileError(error as Error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create profile in Firestore
      if (user) {
        const newProfile: Profile = {
          id: user.uid,
          email: user.email || '',
          full_name: fullName || null,
          phone: null,
          role: 'customer', // Default role
          avatar_url: null,
          branch_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await setDoc(doc(db, 'profiles', user.uid), newProfile);
        setProfile(newProfile);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isCustomer = profile?.role === 'customer';
  const isLoanOfficer = profile?.role === 'loan_officer' || profile?.role === 'admin';

  const value = {
    user,
    profile,
    session,
    loading,
    profileError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
    isCustomer,
    isLoanOfficer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
