
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login, register } from "@/services/authService";

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedSession = localStorage.getItem('auth_session');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedSession && storedUser) {
      setSession(JSON.parse(storedSession));
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await login({ email, password });
    setUser(response.user);
    setSession(response.session);
    localStorage.setItem('auth_session', JSON.stringify(response.session));
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await register({ email, password, fullName });
    setUser(response.user);
    setSession(response.session);
    localStorage.setItem('auth_session', JSON.stringify(response.session));
    localStorage.setItem('auth_user', JSON.stringify(response.user));
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('auth_session');
    localStorage.removeItem('auth_user');
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    signIn,
    signUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
