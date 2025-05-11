import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { appfirebase } from "./firebaseconfig";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const auth = getAuth(appfirebase);
    const db = getFirestore(appfirebase);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setIsLoggedIn(!!user);

      if (user) {
        const snap = await getDoc(doc(db, "usuario", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setPerfil(data);
          localStorage.setItem("userRole", data.rol || "");
          localStorage.setItem("userDisplayName", data.nombre || "");
          localStorage.setItem("userEmail", data.correo || "");
          localStorage.setItem("userPhotoURL", data.photoURL || "");
        } else {
          setPerfil(null);
        }
      } else {
        setPerfil(null);
        localStorage.removeItem("userRole");
        localStorage.removeItem("userDisplayName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPhotoURL");
      }

      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        isLoggedIn,
        isOffline,
        isAdmin: perfil?.rol === "Administrador",
        cargando,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
