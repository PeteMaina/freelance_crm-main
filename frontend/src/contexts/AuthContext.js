import { createContext, useContext, useMemo, useState, useEffect, useRef, useCallback } from "react";
import { loginUser, registerUser } from "../api/authApi";

const TOKEN_KEY = "crm_token";
const EMAIL_KEY = "crm_email";
const TIMEOUT_KEY = "crm_session_timeout"; // user's chosen timeout in ms

// Default: 2 hours. Options exposed to settings page.
export const TIMEOUT_OPTIONS = [
  { label: "30 minutes", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "2 hours", value: 2 * 60 * 60 * 1000 },
  { label: "4 hours", value: 4 * 60 * 60 * 1000 },
  { label: "Never", value: 0 },
];

const DEFAULT_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [email, setEmail] = useState(localStorage.getItem(EMAIL_KEY) || "");
  const [sessionTimeout, setSessionTimeoutState] = useState(
    Number(localStorage.getItem(TIMEOUT_KEY)) || DEFAULT_TIMEOUT
  );

  const timerRef = useRef(null);

  // ─── Core logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken("");
    setEmail("");
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // ─── Reset the inactivity timer on any user activity ────────────────────────
  const resetTimer = useCallback(() => {
    if (!sessionTimeout) return; // "Never" — no timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      logout();
      // Small visual hint so the user knows why they were logged out
      localStorage.setItem("crm_logout_reason", "inactivity");
    }, sessionTimeout);
  }, [sessionTimeout, logout]);

  // ─── Attach activity listeners when authenticated ───────────────────────────
  useEffect(() => {
    if (!token) return; // not logged in — nothing to track

    const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

    EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start the clock immediately on login

    return () => {
      EVENTS.forEach(e => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, resetTimer]);

  // ─── Show "logged out due to inactivity" message on next load ───────────────
  const [wasAutoLoggedOut, setWasAutoLoggedOut] = useState(() => {
    const reason = localStorage.getItem("crm_logout_reason");
    if (reason === "inactivity") {
      localStorage.removeItem("crm_logout_reason");
      return true;
    }
    return false;
  });

  // ─── Auth actions ────────────────────────────────────────────────────────────
  async function login(credentials) {
    const data = await loginUser(credentials);
    await new Promise(resolve => setTimeout(resolve, 800)); // branding delay
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(EMAIL_KEY, credentials.email);
    setToken(data.access_token);
    setEmail(credentials.email);
    setWasAutoLoggedOut(false);
    return data;
  }

  async function register(credentials) {
    await registerUser(credentials);
    return login(credentials);
  }

  // ─── Let the settings page change the timeout ───────────────────────────────
  function updateSessionTimeout(ms) {
    localStorage.setItem(TIMEOUT_KEY, String(ms));
    setSessionTimeoutState(ms);
  }

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated: Boolean(token),
      sessionTimeout,
      wasAutoLoggedOut,
      login,
      register,
      logout,
      updateSessionTimeout,
    }),
    [token, email, sessionTimeout, wasAutoLoggedOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
