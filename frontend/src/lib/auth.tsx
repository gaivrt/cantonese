import { createContext, useContext, useState, type ReactNode } from "react";

interface AuthState {
  token: string | null;
  role: string | null;
  name: string | null;
}

interface AuthContextType extends AuthState {
  login: (token: string, role: string, name: string) => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => ({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    name: localStorage.getItem("name"),
  }));

  const login = (token: string, role: string, name: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("name", name);
    setAuth({ token, role, name });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setAuth({ token: null, role: null, name: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout, isLoggedIn: !!auth.token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
