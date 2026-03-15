import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import MarkChatReadRoundedIcon from "@mui/icons-material/MarkChatReadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import brandLogo from "../logo/brand_logo.png";
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
  Typography,
  Badge,
  Popover,
  MenuItem,
  ListItemIcon,
  CircularProgress,
  Tooltip
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { listNotifications, markAsRead } from "../api/notificationApi";

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
  const [notifications, setNotifications] = useState([]);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await listNotifications();
      if (Array.isArray(data)) setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };
  const activeLabel = useMemo(() => {
    const found = sections.find((item) => item.key === activeSection);
    return found ? found.label : "";
  }, [sections, activeSection]);

  const navContent = (
    <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Top Section: Branding */}
      <Box sx={{ p: 2, pb: 1 }}>
        <img src={brandLogo} alt="ACTIVA Logo" style={{ height: 40, marginBottom: 4 }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
          {subtitle}
        </Typography>
      </Box>

      {/* Middle Section: Navigation (Scrollable) */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 2, py: 1, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(21, 94, 99, 0.15)', borderRadius: 2 } }}>
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
                py: 0.75,
                "&.Mui-selected": {
                  backgroundColor: "rgba(21, 94, 99, 0.12)",
                  borderColor: "rgba(21, 94, 99, 0.35)"
                }
              }}
            >
              <ListItemText
                primary={section.label}
                secondary={section.hint}
                primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: "0.72rem", opacity: 0.8 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Bottom Section: Identity & Footer (Sticky) */}
      <Box sx={{
        p: 2,
        pt: 1.5,
        borderTop: "1px solid rgba(25,22,17,0.08)",
        bgcolor: "rgba(251, 248, 239, 0.95)",
        backdropFilter: 'blur(4px)',
        textAlign: 'center'
      }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ mb: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main", width: 30, height: 30, fontSize: '0.9rem' }}>
            {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Box sx={{ minWidth: 0, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.82rem' }} noWrap>
              {userEmail || "Freelancer"}
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem' }}
              color="text.secondary"
            >
              Go-getter.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#8b9b75', letterSpacing: '0.05em', fontFamily: "'IBM Plex Mono', monospace" }}>
            © {new Date().getFullYear()} ACTIVA
          </Typography> For more info contact
          <Typography
            variant="caption"
            component="a"
            href="https://mainapeter.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: 'text.secondary',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.7rem',
              '&:hover': { color: '#8b9b75' }
            }}
          >
            Peter Maina <OpenInNewRoundedIcon sx={{ fontSize: '0.7rem' }} />
          </Typography>
        </Box>
      </Box>
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

            <IconButton
              color="inherit"
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ color: notifications.length > 0 ? "primary.main" : "text.secondary" }}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsRoundedIcon />
              </Badge>
            </IconButton>

            <Popover
              open={Boolean(notifAnchor)}
              anchorEl={notifAnchor}
              onClose={() => setNotifAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 2, mt: 1, boxShadow: "0 10px 40px rgba(0,0,0,0.12)" } }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                <IconButton size="small" onClick={() => { setRefreshing(true); fetchNotifications().finally(() => setRefreshing(false)); }}>
                  <RefreshRoundedIcon fontSize="small" className={refreshing ? "animate-spin" : ""} />
                </IconButton>
              </Box>
              <Divider />
              <List sx={{ py: 0 }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">All caught up!</Typography>
                  </Box>
                ) : (
                  notifications.map((n) => (
                    <MenuItem key={n.id} sx={{ py: 1.5, px: 2, whiteSpace: 'normal', display: 'flex', alignItems: 'flex-start', borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{n.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>{n.message}</Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: "primary.main", fontWeight: 700 }}>{n.alert_type.toUpperCase()} ALERT</Typography>
                      </Box>
                      <Tooltip title="Mark as read">
                        <IconButton size="small" onClick={(e) => handleMarkRead(n.id, e)} sx={{ ml: 1, color: "text.disabled", "&:hover": { color: "success.main" } }}>
                          <MarkChatReadRoundedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </MenuItem>
                  ))
                )}
              </List>
            </Popover>
            <Button
              variant="outlined"
              sx={{ color: "#155e63", borderColor: "#155e63", "&:hover": { borderColor: "#155e63", bgcolor: "rgba(21, 94, 99, 0.04)" } }}
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
