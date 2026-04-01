import { createContext, useContext, useState, useMemo } from "react";

const PORTAL_TOKEN_KEY = "portal_token";
const PORTAL_CLIENT_NAME = "portal_client_name";
const PORTAL_MAGIC_LINK_TOKEN_KEY = "portal_magic_link_token";

const PortalAuthContext = createContext(null);

export function PortalAuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem(PORTAL_TOKEN_KEY) || "");
  const [clientName, setClientName] = useState(localStorage.getItem(PORTAL_CLIENT_NAME) || "");
  const [magicLinkToken, setMagicLinkToken] = useState(localStorage.getItem(PORTAL_MAGIC_LINK_TOKEN_KEY) || "");

  const login = (data) => {
    localStorage.setItem(PORTAL_TOKEN_KEY, data.access_token);
    localStorage.setItem(PORTAL_CLIENT_NAME, data.client_name);
    localStorage.setItem(PORTAL_MAGIC_LINK_TOKEN_KEY, data.magic_link_token || "");
    setToken(data.access_token);
    setClientName(data.client_name);
    setMagicLinkToken(data.magic_link_token || "");
  };

  const logout = () => {
    localStorage.removeItem(PORTAL_TOKEN_KEY);
    localStorage.removeItem(PORTAL_CLIENT_NAME);
    localStorage.removeItem(PORTAL_MAGIC_LINK_TOKEN_KEY);
    setToken("");
    setClientName("");
    setMagicLinkToken("");
  };

  const value = useMemo(() => ({
    token,
    clientName,
    magicLinkToken,
    isAuthenticated: !!token,
    login,
    logout
  }), [token, clientName, magicLinkToken]);

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) throw new Error("usePortalAuth must be used within PortalAuthProvider");
  return context;
}
