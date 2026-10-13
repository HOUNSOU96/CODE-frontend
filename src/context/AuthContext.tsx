
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "../utils/axios";
import { User } from "../types/User";

// Type du contexte d'authentification
type AuthContextType = {
  user: User | null;
  token: string | null;
  erreur: string | null;
  setUser: (user: User | null) => void;
  setErreur: (msg: string | null) => void;
  verifyOtp: (token: string, user: User) => void;
  loginWithPassword: (token: string, user: User) => void;
  logout: () => void;
  isVerified: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const ADMINS = [
    "deogratiashounsou@gmail.com",
    "admin2@example.com",
    "admin3@exemple.com",
  ];

  const isAdmin = (email?: string) =>
    email
      ? ADMINS.map((e) => e.toLowerCase()).includes(email.toLowerCase())
      : false;

  // ============================================================
  // RESTAURATION DE LA SESSION
  // ============================================================
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedVerified = localStorage.getItem("isVerified");

    if (storedToken) {
      setToken(storedToken);

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          const restoredUser: User = {
            ...parsedUser,
            is_admin: isAdmin(parsedUser?.email),
          };

          setUser(restoredUser);
        } catch (err) {
          console.error(
            "⚠️ Impossible de parser l'utilisateur stocké :",
            err
          );

          localStorage.removeItem("user");
        }
      }

      if (storedVerified === "true") {
        setIsVerified(true);
      }
    }
  }, []);

  // ============================================================
  // CONFIGURATION DU TOKEN + RÉCUPÉRATION DE /ME
  // ============================================================
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
  }, [token]);

  // ============================================================
  // RÉCUPÉRATION DES INFORMATIONS ACTUELLES DE L'UTILISATEUR
  // ============================================================
  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");

      const fetchedUser = res.data;

      const userWithAdmin: User = {
        ...fetchedUser,
        is_admin: isAdmin(fetchedUser?.email),
      };

      setUser(userWithAdmin);

      localStorage.setItem(
        "user",
        JSON.stringify(userWithAdmin)
      );
    } catch (err) {
      console.warn(
        "⚠️ Erreur lors de la récupération de l'utilisateur :",
        err
      );

      logout();
    }
  };

  // ============================================================
  // VÉRIFICATION OTP
  // ============================================================
  const verifyOtp = (newToken: string, newUser: User) => {
    const userWithAdmin: User = {
      ...newUser,
      is_admin: isAdmin(newUser?.email),
    };

    setToken(newToken);
    setUser(userWithAdmin);
    setIsVerified(true);
    setErreur(null);

    localStorage.setItem("token", newToken);
    localStorage.setItem(
      "user",
      JSON.stringify(userWithAdmin)
    );
    localStorage.setItem("isVerified", "true");
    localStorage.removeItem("pendingEmail");
  };

  // ============================================================
  // CONNEXION AVEC MOT DE PASSE
  // ============================================================
  const loginWithPassword = (
    newToken: string,
    newUser: User
  ) => {
    const userWithAdmin: User = {
      ...newUser,
      is_admin: isAdmin(newUser?.email),
    };

    setToken(newToken);
    setUser(userWithAdmin);
    setIsVerified(true);
    setErreur(null);

    localStorage.setItem("token", newToken);
    localStorage.setItem(
      "user",
      JSON.stringify(userWithAdmin)
    );
    localStorage.setItem("isVerified", "true");
  };

  // ============================================================
  // DÉCONNEXION
  // ============================================================
  const logout = () => {
    setToken(null);
    setUser(null);
    setIsVerified(false);
    setErreur(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isVerified");
  };

  // ============================================================
  // ÉTAT D'AUTHENTIFICATION
  // ============================================================
  const isAuthenticated = token !== null;

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        erreur,
        setErreur,
        verifyOtp,
        loginWithPassword,
        logout,
        isVerified,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

