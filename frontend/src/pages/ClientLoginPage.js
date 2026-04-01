import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from "@mui/material";
import { Visibility, VisibilityOff, Phone, Lock } from "@mui/icons-material";
import { checkPortalToken, loginPortal } from "../api/portalApi";
import { usePortalAuth } from "../contexts/PortalAuthContext";

export default function ClientLoginPage() {
  const [token, setToken] = useState("");
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login } = usePortalAuth();

  useEffect(() => {
    // Extract token from URL /?token=XYZ
    const urlParams = new URLSearchParams(window.location.search);
    const t = urlParams.get("token");
    if (!t) {
      setError("No magic link token found. Please use the link provided to you.");
      setLoading(false);
      return;
    }
    setToken(t);
    
    // Verify token
    checkPortalToken(t)
      .then((res) => {
        setClientName(res.client_name);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await loginPortal({ token, phone, password });
      login({ ...data, magic_link_token: token });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", color: "primary.main" }}>
            Client Bug Portal
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 4, color: "text.secondary" }}>
            Welcome back, <strong>{clientName || "Client"}</strong>. Please provide your credentials to continue.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!token && (
             <Alert severity="warning" sx={{ mb: 3 }}>
               Missing access token. Use the link sent to your email.
             </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Phone Number"
              variant="outlined"
              margin="normal"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="System Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={submitting || !token}
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: "bold" }}
            >
              {submitting ? <CircularProgress size={24} color="inherit" /> : "Access Portal"}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2, color: "text.disabled" }}>
            This link is valid for 30 days. For security, do not share it with others.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
