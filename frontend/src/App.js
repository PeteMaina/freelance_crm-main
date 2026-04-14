import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientBugDashboard from "./pages/ClientBugDashboard";
import { PortalAuthProvider, usePortalAuth } from "./contexts/PortalAuthContext";
import theme from "./theme";
import LandingPage from "./pages/LandingPage";
import IssuesPage from "./pages/IssuesPage";
import { useState, useEffect } from "react";

function AppContent() {
  const { isAuthenticated, token, email, logout } = useAuth();
  const {
    isAuthenticated: isPortalAuthenticated,
    magicLinkToken,
    logout: portalLogout
  } = usePortalAuth();

  // Simple "routing": If URL has ?token=, we are in the Client Portal
  const urlParams = new URLSearchParams(window.location.search);
  const portalToken = urlParams.get("token");
  const hasMatchingPortalSession = isPortalAuthenticated && magicLinkToken === portalToken;

  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const normalizedHash = hash.replace(/^#/, "").toLowerCase();
  const isIssuesRoute = normalizedHash.startsWith("issues");
  const isAuthRoute = normalizedHash.startsWith("auth");

  if (portalToken) {
    if (!hasMatchingPortalSession) {
      return <ClientLoginPage />;
    }
    return <ClientBugDashboard onLogout={portalLogout} />;
  }

  if (isIssuesRoute) {
    return <IssuesPage isAuthenticated={isAuthenticated} userEmail={email} />;
  }

  if (!isAuthenticated) {
    return isAuthRoute ? <AuthPage /> : <LandingPage />;
  }

  return <DashboardPage token={token} email={email} onLogout={logout} />;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PortalAuthProvider>
          <AppContent />
        </PortalAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
