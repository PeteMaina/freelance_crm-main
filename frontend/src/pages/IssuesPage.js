import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ImportantDevicesRoundedIcon from "@mui/icons-material/ImportantDevicesRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import GlobalFooter from "../components/GlobalFooter";
import brandLogo from "../logo/brand_logo.png";

const defaultForm = {
  name: "",
  email: "",
  message: "",
};

function encodeForm(data) {
  return Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

export default function IssuesPage({ isAuthenticated = false, userEmail = "" }) {
  const [form, setForm] = useState(() => ({
    ...defaultForm,
    email: userEmail || "",
  }));
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const guidanceItems = useMemo(
    () => [
      "What you expected to happen.",
      "What happened instead.",
      "Any page, browser, or device detail that helps reproduction.",
    ],
    []
  );

  const supportCards = useMemo(
    () => [
      {
        icon: <BugReportRoundedIcon sx={{ color: "primary.main" }} />,
        title: "Broken Flow",
        description: "Report blockers, failed actions, missing data, or anything stopping progress.",
      },
      {
        icon: <InsightsRoundedIcon sx={{ color: "secondary.main" }} />,
        title: "Confusing Experience",
        description: "Flag unclear behavior, rough UX, or moments where the product feels uncertain.",
      },
      {
        icon: <ImportantDevicesRoundedIcon sx={{ color: "success.main" }} />,
        title: "Public by Design",
        description: "Use this page whether you are logged in or not. Every submission goes to ACTIVA.",
      },
    ],
    []
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        "form-name": "activa-issues",
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        page_url: window.location.href,
        "bot-field": "",
      };

      const response = await fetch("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: encodeForm(payload),
      });

      if (!response.ok) {
        throw new Error("Netlify form submission failed.");
      }

      setForm({
        ...defaultForm,
        email: userEmail || "",
      });
      setSnack({
        open: true,
        severity: "success",
        message: "Issue submitted successfully. Netlify has captured the form entry.",
      });
    } catch (error) {
      setSnack({
        open: true,
        severity: "error",
        message: error.message || "We could not submit your issue right now.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleWorkspaceAction() {
    window.location.hash = isAuthenticated ? "" : "auth";
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: { xs: 2, md: 3 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          borderBottom: "1px solid rgba(25,22,17,0.08)",
          bgcolor: "rgba(251, 248, 239, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <img src={brandLogo} alt="ACTIVA Logo" style={{ height: 48 }} />
        <Stack direction="row" spacing={1.25}>
          <Button variant="text" color="inherit" onClick={() => { window.location.hash = ""; }}>
            Home
          </Button>
          <Button variant="outlined" onClick={handleWorkspaceAction}>
            {isAuthenticated ? "Back to Workspace" : "Login"}
          </Button>
        </Stack>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flexGrow: 1 }}>
        <Stack spacing={4}>
          <Paper
            sx={{
              p: { xs: 3, md: 5 },
              background:
                "linear-gradient(135deg, rgba(21,94,99,0.14) 0%, rgba(180,73,21,0.12) 52%, rgba(251,248,239,1) 100%)",
              overflow: "hidden",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Stack spacing={2.25}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    ACTIVA PUBLIC ISSUES DESK
                  </Typography>
                  <Typography variant="h2" sx={{ maxWidth: 640 }}>
                    Submit a challenge clearly, quickly, and without needing an account.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620 }}>
                    This page is publicly accessible and fully owned by ACTIVA. Use it to report
                    bugs, broken journeys, or any issue worth reviewing. The better the context,
                    the easier it is to act on what you send.
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} flexWrap="wrap">
                    <Chip icon={<BugReportRoundedIcon />} label="Public access" />
                    <Chip icon={<CheckCircleRoundedIcon />} label="Name and email required" />
                    <Chip icon={<InsightsRoundedIcon />} label="ACTIVA-owned intake" />
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: "rgba(251, 248, 239, 0.78)",
                    border: "1px solid rgba(21,94,99,0.12)",
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="h4">What belongs here</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Product issues, friction points, reliability concerns, and moments where the
                      experience does not behave as expected.
                    </Typography>
                    <Stack spacing={1.2}>
                      {guidanceItems.map((item) => (
                        <Box
                          key={item}
                          sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              mt: "7px",
                              bgcolor: "secondary.main",
                              flexShrink: 0,
                            }}
                          />
                          <Typography variant="body2">{item}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h3">Submit an Issue</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Tell ACTIVA what you ran into. Netlify will capture the submission for now,
                      and you can connect it to email when you are ready.
                    </Typography>
                  </Box>

                  <Box
                    component="form"
                    name="activa-issues"
                    data-netlify="true"
                    netlify-honeypot="bot-field"
                    onSubmit={handleSubmit}
                  >
                    <input type="hidden" name="form-name" defaultValue="activa-issues" />
                    <input type="hidden" name="bot-field" defaultValue="" />
                    <Stack spacing={2}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            label="Your Name"
                            value={form.name}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, name: event.target.value }))
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            required
                            fullWidth
                            type="email"
                            label="Email Address"
                            value={form.email}
                            onChange={(event) =>
                              setForm((prev) => ({ ...prev, email: event.target.value }))
                            }
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        required
                        fullWidth
                        multiline
                        minRows={8}
                        label="Body / Message / Issue"
                        placeholder="Explain the challenge, where it happened, and anything that helps reproduce it."
                        value={form.message}
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, message: event.target.value }))
                        }
                      />
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "stretch", sm: "center" }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          This currently submits through Netlify forms, not the app database.
                        </Typography>
                        <Button
                          type="submit"
                          variant="contained"
                          endIcon={<ArrowForwardRoundedIcon />}
                          disabled={submitting}
                          sx={{ minWidth: 190 }}
                        >
                          {submitting ? "Submitting..." : "Submit Issue"}
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    Before You Send
                  </Typography>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" color="text.secondary">
                      Include the page, device, or browser if that context matters.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Describe the exact action that produced the issue whenever possible.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      If the problem is visual, explain what looked wrong and what should have appeared.
                    </Typography>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 3 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    What Happens Next
                  </Typography>
                  <Stack spacing={1.5}>
                    <Typography variant="body2" color="text.secondary">
                      Netlify stores the form submission for this public page.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clear, reproducible reports are easier to review and prioritize.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your email can be connected to notification handling later without changing the page flow.
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    p: 3,
                    background:
                      "linear-gradient(180deg, rgba(21,94,99,0.08) 0%, rgba(21,94,99,0.02) 100%)",
                  }}
                >
                  <Typography variant="h4" sx={{ mb: 1.5 }}>
                    Need your workspace instead?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Jump back to ACTIVA operations whenever you are ready.
                  </Typography>
                  <Button
                    variant="outlined"
                    endIcon={<ArrowForwardRoundedIcon />}
                    onClick={handleWorkspaceAction}
                  >
                    {isAuthenticated ? "Return to Workspace" : "Open ACTIVA Login"}
                  </Button>
                </Paper>
              </Stack>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            {supportCards.map((card) => (
              <Grid item xs={12} md={4} key={card.title}>
                <Paper sx={{ p: 3, height: "100%" }}>
                  <Stack spacing={1.5}>
                    {card.icon}
                    <Typography variant="h4">{card.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>

      <GlobalFooter />

      <Snackbar
        open={snack.open}
        autoHideDuration={3200}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          variant="filled"
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
