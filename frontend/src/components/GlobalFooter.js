import React from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Box, Button, Grid, Paper, Stack, Typography } from "@mui/material";

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        px: { xs: 2, md: 3 },
        pb: { xs: 2.5, md: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.75, md: 2 },
          bgcolor: "rgba(251, 248, 239, 0.74)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Stack spacing={0.7}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                ACTIVA
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                A calmer way to report product friction.
              </Typography>
              
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Copyright {currentYear} ACTIVA. All rights reserved.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Stack spacing={0.75}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                More Info
              </Typography>
              <Typography
                component="a"
                href="#auth"
                sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
              >
                Workspace access
              </Typography>
              <Typography
                component="a"
                href="#issues"
                sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
              >
                Public issues page
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Stack spacing={0.75}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Founder
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Peter Maina
              </Typography>
              <Typography
                component="a"
                href="https://mainapeter.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  color: "primary.main",
                  textDecoration: "none",
                  fontWeight: 700,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Visit founder profile
                <OpenInNewRoundedIcon sx={{ fontSize: "1rem" }} />
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            mt: 1.75,
            p: 1.5,
            bgcolor: "rgba(21,94,99,0.08)",
            border: "1px solid rgba(21,94,99,0.12)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Have a challenge or an issue to submit?
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                Open the ACTIVA-owned issues page and send your name, email, and issue details.
              </Typography>
            </Box>
            <Button
              component="a"
              href="#issues"
              variant="contained"
              size="small"
              startIcon={<BugReportRoundedIcon />}
              endIcon={<ArrowForwardRoundedIcon />}
            >
              Submit an Issue
            </Button>
          </Stack>
        </Paper>
      </Paper>
    </Box>
  );
}
