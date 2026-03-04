import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
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
        await register(fields);
      }
      setFields(defaultFields);
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
              <Typography
                variant="caption"
                sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                FREELANCE CRM
              </Typography>
              <Typography variant="h1" sx={{ mt: 1.5, maxWidth: 520 }}>
                Run every client like a deliberate operation.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
                This workspace tracks clients, project momentum, and call follow-ups in one command deck.
                Connect to your backend at <strong>{API_BASE_URL}</strong> and operate with real data.
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
                <Typography variant="h4">Execution cadence</Typography>
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
                  type="password"
                  value={fields.password}
                  onChange={(event) =>
                    setFields((prev) => ({ ...prev, password: event.target.value }))
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy}
                  startIcon={busy ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {submitLabel}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
