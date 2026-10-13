"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { currentUser as mockUser } from "@/lib/mock-data";
import { User, Role } from "@/types/saas";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  switchDemoRole?: (role: Role) => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isConfigured: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(mockUser);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConfigured, setIsConfigured] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();

    if (!supabase) {
      // Supabase credentials are not yet populated in .env.local
      setIsConfigured(false);
      setUser(mockUser);
      setIsLoading(false);
      return;
    }

    setIsConfigured(true);

    // Fetch initial Supabase user
    supabase.auth.getUser().then(({ data: { user: sbUser }, error }) => {
      if (sbUser && !error) {
        setUser({
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.email?.split("@")[0] || "Engineer",
          email: sbUser.email || "",
          avatar: sbUser.user_metadata?.avatar_url || "",
          role: (sbUser.user_metadata?.role as Role) || "Owner",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Listen to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Engineer",
          email: session.user.email || "",
          avatar: session.user.user_metadata?.avatar_url || "",
          role: (session.user.user_metadata?.role as Role) || "Owner",
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    router.push("/login");
  };

  const switchDemoRole = async (role: Role) => {
    if (user) {
      setUser({ ...user, role });
      try {
        await fetch("/api/auth/demo-role", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        signOut,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
