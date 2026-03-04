import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import AuthPage from "./pages/AuthPage";
import theme from "./theme";

function AppContent() {
  const { isAuthenticated, token, email, logout } = useAuth();

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
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
