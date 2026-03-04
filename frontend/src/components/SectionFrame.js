import { Box, Paper, Typography } from "@mui/material";

export default function SectionFrame({ title, subtitle, actions, children }) {
  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          mb: 2
        }}
      >
        <Box>
          <Typography variant="h4">{title}</Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {actions || null}
      </Box>
      {children}
    </Paper>
  );
}
