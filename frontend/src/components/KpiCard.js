import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { Box, Paper, Typography } from "@mui/material";

const toneStyles = {
  sea: {
    stripe: "linear-gradient(135deg, rgba(21,94,99,0.22), rgba(21,94,99,0.06))",
    iconBg: "rgba(21,94,99,0.18)"
  },
  amber: {
    stripe: "linear-gradient(135deg, rgba(169,106,28,0.26), rgba(169,106,28,0.08))",
    iconBg: "rgba(169,106,28,0.2)"
  },
  rust: {
    stripe: "linear-gradient(135deg, rgba(180,73,21,0.24), rgba(180,73,21,0.08))",
    iconBg: "rgba(180,73,21,0.2)"
  },
  moss: {
    stripe: "linear-gradient(135deg, rgba(47,122,74,0.24), rgba(47,122,74,0.08))",
    iconBg: "rgba(47,122,74,0.2)"
  }
};

export default function KpiCard({ label, value, hint, tone = "sea" }) {
  const style = toneStyles[tone] || toneStyles.sea;

  return (
    <Paper
      sx={{
        p: 2.5,
        position: "relative",
        overflow: "hidden",
        minHeight: 146
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: style.stripe,
          pointerEvents: "none"
        }}
      />
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: style.iconBg,
            display: "grid",
            placeItems: "center",
            mb: 1.5
          }}
        >
          <TrendingUpRoundedIcon fontSize="small" />
        </Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h3" sx={{ mt: 0.2 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {hint}
        </Typography>
      </Box>
    </Paper>
  );
}
