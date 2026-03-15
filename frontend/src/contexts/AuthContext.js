import { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api/authApi";

const TOKEN_KEY = "crm_token";
const EMAIL_KEY = "crm_email";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_KEY) || "");

  async function login(credentials) {
    const data = await loginUser(credentials);
    // Add a signature delay for branding animations to play
    await new Promise(resolve => setTimeout(resolve, 800));
    
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(EMAIL_KEY, credentials.email);
    setToken(data.access_token);
    setEmail(credentials.email);
    return data;
  }

  async function register(credentials) {
    await registerUser(credentials);
    return login(credentials);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken("");
    setEmail("");
  }

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout
    }),
    [token, email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
