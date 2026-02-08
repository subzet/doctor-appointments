'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  auth 
} from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User 
} from 'firebase/auth';
import { api } from '@/lib/api';
import { Doctor } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  isNewUser: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: (data: { name: string; specialty?: string }) => Promise<{ doctor: Doctor }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Create or get doctor from backend
          const result = await api.createOrGetDoctor({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
            email: firebaseUser.email || '',
          });
          
          setDoctor(result.doctor);
          setIsNewUser(result.isNew);
          
          // Redirect logic
          if (result.isNew && pathname !== '/onboarding') {
            router.push('/onboarding');
          } else if (!result.isNew && pathname === '/login') {
            router.push('/');
          }
        } catch (error) {
          console.error('Error syncing doctor:', error);
        }
      } else {
        setDoctor(null);
        setIsNewUser(false);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
    setDoctor(null);
    setIsNewUser(false);
  };

  const completeOnboarding = async (data: { name: string; specialty?: string }): Promise<{ doctor: Doctor }> => {
    if (!user) throw new Error('No user logged in');
    
    setLoading(true);
    try {
      const updatedDoctor = await api.updateDoctor(user.uid, {
        name: data.name,
        specialty: data.specialty,
      });
      
      setDoctor(updatedDoctor);
      setIsNewUser(false);
      return { doctor: updatedDoctor };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      doctor, 
      isNewUser,
      loading, 
      login, 
      loginWithGoogle, 
      logout,
      completeOnboarding 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
