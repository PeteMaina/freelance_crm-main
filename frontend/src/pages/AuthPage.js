import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import brandLogo from "../logo/brand_logo.png";
import faviconLogo from "../logo/favicon_logo.png";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../api/http";

const defaultFields = {
  email: "",
  password: ""
};

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [fields, setFields] = useState(defaultFields);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  const submitLabel = useMemo(() => {
    return mode === "login" ? "Sign In" : "Create Account";
  }, [mode]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login(fields);
      } else {
        if (!acceptedTerms) {
          setError("You must accept the terms and conditions.");
          setBusy(false);
          return;
        }
        await register(fields);
      }
      setAuthSuccess(true);
      setFields(defaultFields);
      // Brief delay to show animation before redirect (login function usually redirects, 
      // but if it's external, we might need a signal or just wait if logic allows.
      // Assuming login/register from context updates state which causes parent to show dashboard.
    } catch (submitError) {
      setError(submitError.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 8 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              minHeight: 520,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background:
                "linear-gradient(135deg, rgba(21,94,99,0.15) 0%, rgba(180,73,21,0.12) 45%, rgba(251,248,239,1) 100%)"
            }}
          >
            <Box>
              <Box sx={{ mb: 2 }}>
                <img src={brandLogo} alt="ACTIVA Logo" style={{ height: 48 }} />
              </Box>
              <Typography variant="h1" sx={{ mt: 1.5, maxWidth: 520 }}>
                Run every client like a deliberate operation.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
                This operations hub tracks clients, project momentum, and roadmap milestones in one high-performance deck.

              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Mission Signal
                </Typography>
                <Typography variant="h4">Client retention</Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep communication loops tight with dedicated follow-up tracking.
                </Typography>
              </Paper>
              <Paper sx={{ p: 2, flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Workflow Signal
                </Typography>
                <Typography variant="h4">Execution Excellence</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor project progress percentages and intervene early.
                </Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: { xs: 3, md: 4 }, minHeight: 520 }}>
            <Tabs
              value={mode}
              onChange={(_, value) => {
                setMode(value);
                setError("");
              }}
              sx={{ mb: 3 }}
            >
              <Tab
                icon={<LoginRoundedIcon fontSize="small" />}
                iconPosition="start"
                value="login"
                label="Sign In"
              />
              <Tab
                icon={<PersonAddRoundedIcon fontSize="small" />}
                iconPosition="start"
                value="register"
                label="Register"
              />
            </Tabs>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {mode === "login" ? "Welcome Back" : "Open Your Workspace"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {mode === "login"
                ? "Use your existing account to continue."
                : "Create an account and sign in automatically."}
            </Typography>
            {error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : null}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  required
                  label="Email"
                  type="email"
                  value={fields.email}
                  onChange={(event) =>
                    setFields((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <TextField
                  required
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={fields.password}
                  onChange={(event) =>
                    setFields((prev) => ({ ...prev, password: event.target.value }))
                  }
                  InputProps={{
                    endAdornment: (
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                      </IconButton>
                    )
                  }}
                />
                {mode === "register" && (
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={acceptedTerms} 
                        onChange={(e) => setAcceptedTerms(e.target.checked)} 
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2">
                        I agree to the <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}>Terms & Conditions</Box> and <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</Box>
                      </Typography>
                    }
                    sx={{ mb: 1 }}
                  />
                )}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy || (mode === "register" && !acceptedTerms)}
                  startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {submitLabel}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Auth Success Animation Overlay */}
      {authSuccess && (
        <Box 
          sx={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            bgcolor: 'rgba(251, 248, 239, 0.95)', 
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box className="zoom-pulse" sx={{ textAlign: 'center' }}>
            <img src={faviconLogo} alt="Success" style={{ width: 120, height: 120 }} />
            <Typography variant="h3" sx={{ mt: 3, color: '#8b9b75' }}>Operations Online</Typography>
          </Box>
        </Box>
      )}
    </Container>
  );
}
