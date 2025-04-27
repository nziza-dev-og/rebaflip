import  { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, adminCode: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateAdminCode: (newCode: string) => Promise<void>;
  darkMode: boolean;
  toggleDarkMode: () => void;
  emailNotifications: boolean;
  toggleEmailNotifications: () => void;
  themeOpacity: number;
  setThemeOpacity: (opacity: number) => void;
}

// Default admin code - this would normally be stored in a secure environment variable
let ADMIN_SECRET_CODE = "ingllix";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    // Get from localStorage or default to true
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [emailNotifications, setEmailNotifications] = useState(() => {
    // Get from localStorage or default to true
    const saved = localStorage.getItem('emailNotifications');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [themeOpacity, setThemeOpacityState] = useState(() => {
    // Get from localStorage or default to 100%
    const saved = localStorage.getItem('themeOpacity');
    return saved !== null ? parseInt(saved) : 100;
  });

  // Apply dark mode class to body
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Apply theme opacity
  useEffect(() => {
    document.body.style.setProperty('--theme-opacity', `${themeOpacity}%`);
    localStorage.setItem('themeOpacity', themeOpacity.toString());
  }, [themeOpacity]);

  // Save email notification preference
  useEffect(() => {
    localStorage.setItem('emailNotifications', JSON.stringify(emailNotifications));
  }, [emailNotifications]);

  // Load admin code from Firestore on init
  useEffect(() => {
    const fetchAdminCode = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'admin'));
        if (settingsDoc.exists() && settingsDoc.data().secretCode) {
          ADMIN_SECRET_CODE = settingsDoc.data().secretCode;
        } else {
          // Initialize the admin settings document if it doesn't exist
          await setDoc(doc(db, 'settings', 'admin'), {
            secretCode: ADMIN_SECRET_CODE,
            updatedAt: new Date()
          });
        }
      } catch (error) {
        console.error("Error loading admin settings:", error);
      }
    };

    fetchAdminCode();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              isAdmin: userDoc.data().isAdmin || false,
              preferences: userDoc.data().preferences || {
                darkMode: true,
                emailNotifications: true,
                themeOpacity: 100
              }
            });
            
            // Sync preferences if they exist in user doc
            if (userDoc.data().preferences) {
              setDarkMode(userDoc.data().preferences.darkMode);
              setEmailNotifications(userDoc.data().preferences.emailNotifications);
              if (userDoc.data().preferences.themeOpacity) {
                setThemeOpacityState(userDoc.data().preferences.themeOpacity);
              }
            }
          } else {
            // Create user doc if it doesn't exist
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              isAdmin: false,
              preferences: {
                darkMode: true,
                emailNotifications: true,
                themeOpacity: 100
              }
            });
            
            await setDoc(doc(db, 'users', firebaseUser.uid), {
              email: firebaseUser.email,
              isAdmin: false,
              createdAt: new Date(),
              preferences: {
                darkMode: true,
                emailNotifications: true,
                themeOpacity: 100
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string, adminCode: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const isAdmin = adminCode === ADMIN_SECRET_CODE;
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        isAdmin,
        createdAt: new Date(),
        preferences: {
          darkMode,
          emailNotifications,
          themeOpacity
        }
      });
    } catch (error: any) {
      console.error("Registration error:", error.message);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateAdminCode = async (newCode: string) => {
    if (!user?.isAdmin) {
      throw new Error('Only administrators can update the admin code');
    }
    
    try {
      await updateDoc(doc(db, 'settings', 'admin'), {
        secretCode: newCode,
        updatedAt: new Date()
      });
      
      ADMIN_SECRET_CODE = newCode;
      return true;
    } catch (error) {
      console.error("Error updating admin code:", error);
      throw error;
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    
    // Update in user preferences if user is logged in
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          'preferences.darkMode': newValue
        });
      } catch (error) {
        console.error("Error updating dark mode preference:", error);
      }
    }
  };

  const toggleEmailNotifications = async () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    
    // Update in user preferences if user is logged in
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          'preferences.emailNotifications': newValue
        });
      } catch (error) {
        console.error("Error updating email notification preference:", error);
      }
    }
  };

  const setThemeOpacity = async (opacity: number) => {
    setThemeOpacityState(opacity);
    
    // Update in user preferences if user is logged in
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          'preferences.themeOpacity': opacity
        });
      } catch (error) {
        console.error("Error updating theme opacity:", error);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateAdminCode,
    darkMode,
    toggleDarkMode,
    emailNotifications,
    toggleEmailNotifications,
    themeOpacity,
    setThemeOpacity
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
 