import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import ClientLoginPage from "./pages/ClientLoginPage";
import ClientBugDashboard from "./pages/ClientBugDashboard";
import { PortalAuthProvider, usePortalAuth } from "./contexts/PortalAuthContext";
import theme from "./theme";

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

  if (portalToken) {
    if (!hasMatchingPortalSession) {
      return <ClientLoginPage />;
    }
    return <ClientBugDashboard onLogout={portalLogout} />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
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
