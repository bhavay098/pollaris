import { createContext, useContext } from "react";
import { authClient } from "../lib/auth-client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { data: session, isPending: loading, refetch } = authClient.useSession();
  const user = session?.user || null;

  const login = async (payload) => {
    const { data, error } = await authClient.signIn.email(payload);
    if (error) throw new Error(error.message);
    return data;
  };

  const register = async (payload) => {
    const { data, error } = await authClient.signUp.email(payload);
    if (error) throw new Error(error.message);
    return data;
  };

  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) throw new Error(error.message);
  };

  const loginWithGoogle = async () => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) throw new Error(error.message);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, loginWithGoogle, logout, refreshMe: refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
