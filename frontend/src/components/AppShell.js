import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";

export default function AppShell({
  sections,
  activeSection,
  onSectionChange,
  title,
  subtitle,
  userEmail,
  onLogout,
  children
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeLabel = useMemo(() => {
    const found = sections.find((item) => item.key === activeSection);
    return found ? found.label : "";
  }, [sections, activeSection]);

  const navContent = (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {subtitle}
      </Typography>
      <List disablePadding>
        {sections.map((section) => (
          <ListItemButton
            key={section.key}
            selected={section.key === activeSection}
            onClick={() => {
              onSectionChange(section.key);
              setDrawerOpen(false);
            }}
            sx={{
              mb: 1,
              borderRadius: 2,
              border: "1px solid transparent",
              "&.Mui-selected": {
                backgroundColor: "rgba(21, 94, 99, 0.12)",
                borderColor: "rgba(21, 94, 99, 0.35)"
              }
            }}
          >
            <ListItemText
              primary={section.label}
              secondary={section.hint}
              primaryTypographyProps={{ fontWeight: 700 }}
              secondaryTypographyProps={{ fontSize: "0.78rem" }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34 }}>
          {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {userEmail || "Freelancer"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
            color="text.secondary"
          >
            command mode
          </Typography>
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      <Box
        sx={{
          width: { xs: 0, md: 280 },
          display: { xs: "none", md: "block" },
          borderRight: "1px solid rgba(25,22,17,0.1)",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          height: "100vh"
        }}
      >
        {navContent}
      </Box>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>{navContent}</Box>
      </Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: "rgba(251, 248, 239, 0.92)",
            borderBottom: "1px solid rgba(25,22,17,0.1)",
            backdropFilter: "blur(8px)"
          }}
        >
          <Toolbar sx={{ gap: 1.5 }}>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
              color="inherit"
            >
              <MenuRoundedIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                ACTIVE VIEW
              </Typography>
              <Typography variant="h4" noWrap>
                {activeLabel}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<LogoutRoundedIcon />}
              onClick={onLogout}
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
