import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Alert
} from "@mui/material";
import { Add, BugReport, Logout, Refresh } from "@mui/icons-material";
import { getPortalProjects, getPortalBugs, createPortalBug } from "../api/portalApi";
import { usePortalAuth } from "../contexts/PortalAuthContext";

export default function ClientBugDashboard() {
  const { token, clientName, logout } = usePortalAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [newBug, setNewBug] = useState({
    title: "",
    description: "",
    severity: "medium",
    priority: "p2",
    steps_to_reproduce: "",
    expected_behavior: "",
    actual_behavior: "",
    environment: "production"
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchBugs(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const data = await getPortalProjects(token);
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
      setLoading(false);
    } catch (err) {
      setError("Failed to load projects.");
      setLoading(false);
    }
  };

  const fetchBugs = async (projectId) => {
    try {
      const data = await getPortalBugs(token, projectId);
      setBugs(data);
    } catch (err) {
      setError("Failed to load bugs.");
    }
  };

  const handleCreateBug = async () => {
    try {
      await createPortalBug(token, selectedProject, newBug);
      setOpen(false);
      fetchBugs(selectedProject);
      setNewBug({
        title: "",
        description: "",
        severity: "medium",
        priority: "p2",
        steps_to_reproduce: "",
        expected_behavior: "",
        actual_behavior: "",
        environment: "production"
      });
    } catch (err) {
      setError("Failed to create bug.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "error";
      case "in_progress": return "warning";
      case "resolved": return "success";
      case "closed": return "default";
      default: return "default";
    }
  };

  return (
    <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "primary.main", color: "white", py: 4, mb: 4, boxShadow: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: "bold" }}>Client Bug Portal</Typography>
              <Typography variant="subtitle1">Hello, {clientName}. Reporting bugs for your projects.</Typography>
            </Box>
            <Button 
                variant="outlined" 
                color="inherit" 
                startIcon={<Logout />} 
                onClick={logout}
                sx={{ borderRadius: 2 }}
            >
              Sign Out
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <TextField
            select
            label="Selected Project"
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            sx={{ minWidth: 300, bgcolor: "white" }}
          >
            {projects.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
            ))}
          </TextField>

          <Box>
            <Tooltip title="Refresh bugs list">
                <IconButton onClick={() => fetchBugs(selectedProject)} sx={{ mr: 1, bgcolor: "white" }}>
                    <Refresh />
                </IconButton>
            </Tooltip>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
                sx={{ py: 1.5, px: 3, borderRadius: 2, fontWeight: "bold", boxShadow: 3 }}
            >
                Report New Bug
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Bug ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Severity</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Reported On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bugs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <BugReport sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No bugs reported yet for this project.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bugs.map((bug) => (
                  <TableRow key={bug.id} hover>
                    <TableCell>#{bug.id}</TableCell>
                    <TableCell sx={{ fontWeight: "medium" }}>{bug.title}</TableCell>
                    <TableCell>
                      <Chip label={bug.status.replace("_", " ").toUpperCase()} color={getStatusColor(bug.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={bug.severity.toUpperCase()} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>{new Date(bug.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      {/* Report Bug Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: "bold", bgcolor: "grey.50" }}>Report a New Bug</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Bug Title"
              required
              value={newBug.title}
              onChange={(e) => setNewBug({...newBug, title: e.target.value})}
              sx={{ gridColumn: "span 2" }}
            />
            <TextField
              select
              fullWidth
              label="Severity"
              value={newBug.severity}
              onChange={(e) => setNewBug({...newBug, severity: e.target.value})}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Environment"
              value={newBug.environment}
              onChange={(e) => setNewBug({...newBug, environment: e.target.value})}
            >
              <MenuItem value="dev">Development</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </TextField>
          </Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description / Context"
            value={newBug.description}
            onChange={(e) => setNewBug({...newBug, description: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
               fullWidth
               multiline
               rows={2}
               label="Steps to Reproduce"
               value={newBug.steps_to_reproduce}
               onChange={(e) => setNewBug({...newBug, steps_to_reproduce: e.target.value})}
               sx={{ mb: 2 }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
             <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Expected Behavior"
                  value={newBug.expected_behavior}
                  onChange={(e) => setNewBug({...newBug, expected_behavior: e.target.value})}
             />
             <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Actual Behavior"
                  value={newBug.actual_behavior}
                  onChange={(e) => setNewBug({...newBug, actual_behavior: e.target.value})}
             />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
          <Button onClick={() => setOpen(false)} sx={{ fontWeight: "bold" }}>Cancel</Button>
          <Button onClick={handleCreateBug} variant="contained" disabled={!newBug.title} sx={{ fontWeight: "bold", px: 4 }}>
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
