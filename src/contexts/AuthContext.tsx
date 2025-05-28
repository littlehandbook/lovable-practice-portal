
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthUser {
  id: string;
  email: string;
}

interface AuthSession {
  access_token: string;
  refresh_token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'Found session' : 'No session');
      updateAuthState(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session ? 'Session active' : 'No session');
      updateAuthState(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthState = (session: Session | null) => {
    if (session?.user) {
      const authUser = {
        id: session.user.id,
        email: session.user.email!,
      };
      const authSession = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      };
      
      setUser(authUser);
      setSession(authSession);
      
      // Still store in localStorage for compatibility
      localStorage.setItem('auth_session', JSON.stringify(authSession));
      localStorage.setItem('auth_user', JSON.stringify(authUser));
    } else {
      setUser(null);
      setSession(null);
      localStorage.removeItem('auth_session');
      localStorage.removeItem('auth_user');
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Signing in with Supabase');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful');
    // Auth state will be updated via the onAuthStateChange listener
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Signing up with Supabase');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }

    console.log('Sign up successful');
    // Auth state will be updated via the onAuthStateChange listener
  };

  const signOut = async () => {
    console.log('Signing out');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }

    console.log('Sign out successful');
    // Auth state will be updated via the onAuthStateChange listener
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
