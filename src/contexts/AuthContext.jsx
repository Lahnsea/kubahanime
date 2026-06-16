import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseMocked } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isFirebaseMocked) {
      const storedUser = localStorage.getItem('mock_current_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buat/update user doc di Firestore
        const userRef = doc(db, 'users', firebaseUser.uid, 'profile', 'info');
        const snap = await getDoc(userRef).catch(() => null);
        if (!snap?.exists()) {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || '',
            photoURL: firebaseUser.photoURL || '',
            createdAt: serverTimestamp(),
          }).catch(() => {});
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // ── Google Sign In ──────────────────────────────────────────────────────────
  async function signInWithGoogle() {
    setError(null);
    if (isFirebaseMocked) {
      const mockGoogleUser = {
        uid: 'mock-google-uid-123',
        email: 'googleuser@example.com',
        displayName: 'Google User',
        photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=GoogleUser',
      };
      localStorage.setItem('mock_current_user', JSON.stringify(mockGoogleUser));
      setUser(mockGoogleUser);
      return { success: true, user: mockGoogleUser };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { success: true, user: result.user };
    } catch (err) {
      const msg = getFriendlyError(err.code);
      setError(msg);
      return { success: false, error: msg };
    }
  }

  // ── Email/Password Login ────────────────────────────────────────────────────
  async function loginWithEmail(email, password) {
    setError(null);
    if (isFirebaseMocked) {
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const found = users.find(u => u.email === email);
      if (!found) {
        const msg = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
        setError(msg);
        return { success: false, error: msg };
      }
      if (found.password !== password) {
        const msg = 'Password salah. Coba lagi.';
        setError(msg);
        return { success: false, error: msg };
      }
      const loggedUser = {
        uid: found.uid,
        email: found.email,
        displayName: found.displayName,
        photoURL: found.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(found.displayName)}`,
      };
      localStorage.setItem('mock_current_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (err) {
      const msg = getFriendlyError(err.code);
      setError(msg);
      return { success: false, error: msg };
    }
  }

  // ── Register ────────────────────────────────────────────────────────────────
  async function registerWithEmail(email, password, displayName) {
    setError(null);
    if (isFirebaseMocked) {
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const exist = users.some(u => u.email === email);
      if (exist) {
        const msg = 'Email sudah terdaftar. Silakan login.';
        setError(msg);
        return { success: false, error: msg };
      }
      const newUser = {
        uid: `mock-uid-${Date.now()}`,
        email,
        password,
        displayName,
        photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(displayName)}`,
      };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));

      // Auto login after registration
      const loggedUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        photoURL: newUser.photoURL,
      };
      localStorage.setItem('mock_current_user', JSON.stringify(loggedUser));
      setUser(loggedUser);
      return { success: true, user: loggedUser };
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return { success: true, user: result.user };
    } catch (err) {
      const msg = getFriendlyError(err.code);
      setError(msg);
      return { success: false, error: msg };
    }
  }

  // ── Sign Out ────────────────────────────────────────────────────────────────
  async function logout() {
    if (isFirebaseMocked) {
      localStorage.removeItem('mock_current_user');
      setUser(null);
      return;
    }
    await signOut(auth);
    setUser(null);
  }

  // ── Update Profile ──────────────────────────────────────────────────────────
  async function updateProfileInfo(displayName, photoURL) {
    setError(null);
    if (isFirebaseMocked) {
      const loggedUser = JSON.parse(localStorage.getItem('mock_current_user') || '{}');
      loggedUser.displayName = displayName;
      loggedUser.photoURL = photoURL;
      localStorage.setItem('mock_current_user', JSON.stringify(loggedUser));

      // Update mock database as well
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const updatedUsers = users.map(u => u.uid === loggedUser.uid ? { ...u, displayName, photoURL } : u);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));

      setUser(loggedUser);
      return { success: true };
    }

    try {
      if (!auth.currentUser) throw new Error('User not logged in');
      await updateProfile(auth.currentUser, { displayName, photoURL });
      
      // Update Firestore profile doc as well
      const userRef = doc(db, 'users', auth.currentUser.uid, 'profile', 'info');
      await setDoc(userRef, {
        displayName,
        photoURL,
      }, { merge: true }).catch(() => {});

      // Force refresh user state in React
      setUser({ ...auth.currentUser });
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Gagal memperbarui profil.';
      setError(msg);
      return { success: false, error: msg };
    }
  }

  // ── Update Password ─────────────────────────────────────────────────────────
  async function changeUserPassword(newPassword) {
    setError(null);
    if (isFirebaseMocked) {
      const loggedUser = JSON.parse(localStorage.getItem('mock_current_user') || '{}');
      const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const updatedUsers = users.map(u => u.uid === loggedUser.uid ? { ...u, password: newPassword } : u);
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      return { success: true };
    }

    try {
      if (!auth.currentUser) throw new Error('User not logged in');
      await updatePassword(auth.currentUser, newPassword);
      return { success: true };
    } catch (err) {
      const msg = getFriendlyError(err.code) || err.message || 'Gagal mengganti password.';
      setError(msg);
      return { success: false, error: msg };
    }
  }

  function clearError() { setError(null); }

  const value = {
    user,
    loading,
    error,
    clearError,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateProfileInfo,
    changeUserPassword,
    isLoggedIn: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// ── Error messages dalam Bahasa Indonesia ──────────────────────────────────────
function getFriendlyError(code) {
  const messages = {
    'auth/email-already-in-use': 'Email sudah terdaftar. Silakan login.',
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/user-not-found': 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.',
    'auth/wrong-password': 'Password salah. Coba lagi.',
    'auth/weak-password': 'Password terlalu lemah. Minimal 6 karakter.',
    'auth/popup-closed-by-user': 'Login dibatalkan.',
    'auth/network-request-failed': 'Koneksi gagal. Periksa internet kamu.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
    'auth/invalid-credential': 'Email atau password salah.',
  };
  return messages[code] || 'Terjadi kesalahan. Silakan coba lagi.';
}
