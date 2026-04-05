import React from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Grid,
  Paper
} from "@mui/material";
import brandLogo from "../logo/brand_logo.png";
import GlobalFooter from "../components/GlobalFooter";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import ImportantDevicesRoundedIcon from "@mui/icons-material/ImportantDevicesRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

export default function LandingPage() {
  const handleGetStarted = () => {
    window.location.hash = "auth";
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Navigation Bar */}
      <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <img src={brandLogo} alt="ACTIVA Logo" style={{ height: 48 }} />
        <Button variant="outlined" color="primary" onClick={handleGetStarted} sx={{ fontWeight: 700 }}>
          Login
        </Button>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="section"
          sx={{
            py: { xs: 8, md: 12 },
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "linear-gradient(135deg, rgba(21,94,99,0.05) 0%, rgba(180,73,21,0.05) 100%)",
            borderRadius: 4,
            mb: 8
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            sx={{
              fontWeight: 800,
              maxWidth: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '3.75rem' },
              lineHeight: 1.1
            }}
          >
            Run every client like a <Box component="span" sx={{ color: 'primary.main' }}>deliberate operation</Box>.
          </Typography>
          <Typography
            component="p"
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 700, mb: 5, fontWeight: 400, lineHeight: 1.5 }}
          >
            ACTIVA is the ultimate operations hub designed for elite independent consultants. Stop leaking revenue to poor communication. Start operating flawlessly.
          </Typography>
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              onClick={handleGetStarted}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}
            >
              Start Free Workspace
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}
            >
              See How It Works
            </Button>
          </Stack>
        </Box>

        {/* Feature Matrix */}
        <Box component="section" sx={{ pb: { xs: 8, md: 12 } }}>
          <Typography component="h2" variant="h3" align="center" sx={{ fontWeight: 700, mb: 6 }}>
            The productivity steroid your freelance business needs.
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                icon: <ImportantDevicesRoundedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />,
                title: "Dedicated Client Portals",
                desc: "Give your clients a stunning 'magic link' bug-tracking and communication portal. Impress instantly."
              },
              {
                icon: <SpeedRoundedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />,
                title: "Execution Excellence",
                desc: "Monitor project momentum and completion percentages instantly. Identify bottlenecks before they happen."
              },
              {
                icon: <AccessTimeRoundedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />,
                title: "Asynchronous Workflows",
                desc: "Never lose a status update again. Keep communication loops tight without unnecessary zooming or calling."
              },
              {
                icon: <AutoGraphRoundedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />,
                title: "Client Retention Metrics",
                desc: "By standardizing your operations, your clients stick around longer. It really is that simple."
              }
            ].map((feature, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'rgba(251, 248, 239, 0.4)',
                    border: '1px solid rgba(21, 94, 99, 0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 2 }
                  }}
                >
                  {feature.icon}
                  <Typography component="h3" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography component="p" variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
      <GlobalFooter />
    </Box>
  );
}
