import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { auth, googleProvider } from "../firebase/config";
import { createUserProfile, getUserProfile } from "../services/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await createUserProfile(user);
        setProfile(await getUserProfile(user.uid));
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await createUserProfile(credential.user, name);
    setProfile(await getUserProfile(credential.user.uid));
    return credential.user;
  }, []);

  const login = useCallback(({ email, password }) => 
    signInWithEmailAndPassword(auth, email, password), []);

  const loginWithGoogle = useCallback(async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    await createUserProfile(credential.user);
    setProfile(await getUserProfile(credential.user.uid));
    return credential.user;
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return null;
    const nextProfile = await getUserProfile(auth.currentUser.uid);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      loading,
      signup,
      login,
      loginWithGoogle,
      logout,
      refreshProfile,
    }),
    [currentUser, profile, loading, signup, login, loginWithGoogle, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
