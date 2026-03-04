import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#155E63"
    },
    secondary: {
      main: "#B44915"
    },
    background: {
      default: "#F5F2EA",
      paper: "#FBF8EF"
    },
    text: {
      primary: "#191611",
      secondary: "#5A5043"
    },
    success: {
      main: "#2F7A4A"
    },
    warning: {
      main: "#A96A1C"
    }
  },
  shape: {
    borderRadius: 14
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "3.2rem",
      lineHeight: 1
    },
    h2: {
      fontWeight: 700,
      fontSize: "2.2rem"
    },
    h3: {
      fontWeight: 700,
      fontSize: "1.6rem"
    },
    h4: {
      fontWeight: 700,
      fontSize: "1.25rem"
    },
    body1: {
      fontSize: "0.98rem"
    },
    button: {
      textTransform: "none",
      fontWeight: 700
    }
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(25,22,17,0.08)",
          boxShadow: "0 12px 28px rgba(25,22,17,0.08)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          paddingInline: 18
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontFamily: "'IBM Plex Mono', monospace"
        }
      }
    }
  }
});

export default theme;
