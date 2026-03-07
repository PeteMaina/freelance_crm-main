import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent,
  Avatar,
  Rating,
  Divider,
  Autocomplete,
  FormControlLabel,
  Switch,
  FormLabel,
  RadioGroup,
  Radio,
  Tooltip,
  Badge,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createCall, listCalls, toggleCall, getUpcomingCalls, getOverdueCalls } from "../api/callApi";
import { createClient, listClients, updateClient, deleteClient, getClientMetrics, searchClients, createContact, listContacts } from "../api/clientApi";
import { createProject, listProjects, togglePhase, createTask, listTasks, toggleTask, createMilestone, listMilestones, toggleMilestone, createBug, listBugs, updateProject, updateTask, deleteProject } from "../api/projectApi";
import AppShell from "../components/AppShell";
import KpiCard from "../components/KpiCard";
import SectionFrame from "../components/SectionFrame";

const sectionConfig = [
  { key: "overview", label: "Overview", hint: "Live health indicators" },
  { key: "clients", label: "Clients", hint: "Client intake and management" },
  { key: "projects", label: "Projects", hint: "Execution and progress" },
  { key: "tasks", label: "Tasks", hint: "Task management" },
  { key: "milestones", label: "Milestones", hint: "Project milestones" },
  { key: "bugs", label: "Bugs", hint: "Bug tracking" },
  { key: "calls", label: "Calls", hint: "Follow-ups and cadence" }
];

const defaultClientForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  industry: "",
  source: "",
  status: "active",
  rating: 0,
  budget_range_min: "",
  budget_range_max: "",
  timezone: "",
  language: "en",
  notes: "",
  tags: "",
  payment_terms: "net30"
};

const defaultProjectForm = {
  title: "",
  description: "",
  status: "active",
  priority: "medium",
  category: "",
  tags: "",
  is_personal: false,
  is_growth: false,
  budget: "",
  hourly_rate: "",
  currency: "USD",
  billing_type: "hourly",
  start_date: "",
  expected_end_date: "",
  client_id: ""
};

const defaultTaskForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  assignee: "",
  due_date: "",
  start_date: "",
  estimated_hours: "",
  tags: ""
};

const defaultMilestoneForm = {
  title: "",
  description: "",
  due_date: ""
};

const defaultBugForm = {
  title: "",
  description: "",
  severity: "medium",
  priority: "medium",
  status: "open",
  steps_to_reproduce: "",
  expected_behavior: "",
  actual_behavior: "",
  environment: "development",
  browser: "",
  operating_system: "",
  assignee: "",
  reporter: ""
};

const defaultCallForm = {
  title: "",
  notes: "",
  scheduled_at: "",
  duration: 30,
  call_type: "general"
};

function statusColor(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("active")) return "success";
  if (normalized.includes("hold")) return "warning";
  if (normalized.includes("done") || normalized.includes("complete") || normalized.includes("resolved") || normalized.includes("closed")) return "default";
  if (normalized.includes("prospect")) return "info";
  if (normalized.includes("archived")) return "default";
  return "primary";
}

function priorityColor(priority) {
  const normalized = String(priority || "").toLowerCase();
  if (normalized.includes("critical")) return "error";
  if (normalized.includes("high")) return "warning";
  if (normalized.includes("medium")) return "info";
  return "default";
}

function severityColor(severity) {
  const normalized = String(severity || "").toLowerCase();
  if (normalized.includes("critical")) return "error";
  if (normalized.includes("high")) return "warning";
  if (normalized.includes("medium")) return "info";
  return "default";
}

export default function DashboardPage({ token, email, onLogout }) {
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [error, setError] = useState("");

  // Data states
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [callsByProject, setCallsByProject] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [allCalls, setAllCalls] = useState([]);

  // Form states
  const [clientForm, setClientForm] = useState(defaultClientForm);
  const [projectForm, setProjectForm] = useState(defaultProjectForm);
  const [taskForm, setTaskForm] = useState(defaultTaskForm);
  const [milestoneForm, setMilestoneForm] = useState(defaultMilestoneForm);
  const [bugForm, setBugForm] = useState(defaultBugForm);
  const [callForm, setCallForm] = useState(defaultCallForm);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [bugDialogOpen, setBugDialogOpen] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  const filteredClients = useMemo(() => {
    let result = clients;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name?.toLowerCase().includes(query) || 
        c.email?.toLowerCase().includes(query) ||
        c.company?.toLowerCase().includes(query)
      );
    }
    if (filterStatus) {
      result = result.filter(c => c.status === filterStatus);
    }
    return result;
  }, [clients, searchQuery, filterStatus]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.title?.toLowerCase().includes(query));
    }
    if (filterStatus) {
      result = result.filter(p => p.status === filterStatus);
    }
    if (filterPriority) {
      result = result.filter(p => p.priority === filterPriority);
    }
    return result;
  }, [projects, searchQuery, filterStatus, filterPriority]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => t.title?.toLowerCase().includes(query));
    }
    if (filterStatus) {
      result = result.filter(t => t.status === filterStatus);
    }
    if (filterPriority) {
      result = result.filter(t => t.priority === filterPriority);
    }
    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  const selectedProjectCalls = useMemo(() => {
    if (!selectedProjectId) return [];
    return callsByProject[selectedProjectId] || [];
  }, [callsByProject, selectedProjectId]);

  const metrics = useMemo(() => {
    const activeProjects = projects.filter(p => String(p.status || "").toLowerCase().includes("active")).length;
    const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
    const averageProgress = projects.length ? Math.round(totalProgress / projects.length) : 0;
    const openCalls = allCalls.filter(c => !c.completed).length;
    const overdueCalls = allCalls.filter(c => !c.completed && c.scheduled_at && new Date(c.scheduled_at) < new Date()).length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.is_completed).length;
    const openBugs = bugs.filter(b => b.status === "open").length;
    const criticalBugs = bugs.filter(b => b.severity === "critical" && b.status !== "closed").length;
    const upcomingMilestones = milestones.filter(m => !m.is_completed && m.due_date && new Date(m.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;

    return {
      clientCount: clients.length,
      projectCount: projects.length,
      activeProjects,
      averageProgress,
      openCalls,
      overdueCalls,
      totalTasks,
      completedTasks,
      taskCompletionRate: totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0,
      openBugs,
      criticalBugs,
      upcomingMilestones,
      totalRevenue: clients.reduce((sum, c) => sum + (c.total_revenue || 0), 0)
    };
  }, [clients, projects, tasks, bugs, allCalls, milestones]);

  useEffect(() => {
    void hydrate();
  }, [token]);

  function notify(message, severity = "success") {
    setSnack({ open: true, severity, message });
  }

  async function hydrate() {
    setLoading(true);
    setError("");
    try {
      const [clientData, projectData, allTasksData, allMilestonesData, allBugsData, allCallsData] = await Promise.all([
        listClients(token),
        listProjects(token),
        listAllTasks(token),
        listAllMilestones(token),
        listAllBugs(token),
        listCalls(token)
      ]);

      const safeClients = clientData || [];
      const safeProjects = projectData || [];
      const safeTasks = allTasksData || [];
      const safeMilestones = allMilestonesData || [];
      const safeBugs = allBugsData || [];
      const safeCalls = allCallsData || [];

      setClients(safeClients);
      setProjects(safeProjects);
      setTasks(safeTasks);
      setMilestones(safeMilestones);
      setBugs(safeBugs);
      setAllCalls(safeCalls);

      const callsMap = {};
      await Promise.all(
        safeProjects.map(async (project) => {
          try {
            const callData = await listCalls(project.id, token);
            callsMap[String(project.id)] = callData || [];
          } catch (innerError) {
            callsMap[String(project.id)] = [];
          }
        })
      );
      setCallsByProject(callsMap);

      setSelectedProjectId(prev => {
        if (prev && callsMap[prev]) return prev;
        return safeProjects.length ? String(safeProjects[0].id) : "";
      });
    } catch (hydrateError) {
      setError(hydrateError.message || "Could not load CRM data.");
    } finally {
      setLoading(false);
    }
  }

  // Client handlers
  async function handleClientSubmit(event) {
    event.preventDefault();
    setSubmitting("client");
    try {
      if (editClient) {
        await updateClient(editClient.id, clientForm, token);
        notify("Client updated.");
      } else {
        await createClient(clientForm, token);
        notify("Client created.");
      }
      setClientForm(defaultClientForm);
      setEditClient(null);
      setClientDialogOpen(false);
      await hydrate();
    } catch (submitError) {
      notify(submitError.message || "Could not save client.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleDeleteClient(clientId) {
    if (!confirm("Are you sure you want to delete this client? All related projects will also be deleted.")) return;
    setSubmitting("delete-client");
    try {
      await deleteClient(clientId, token);
      notify("Client deleted.");
      await hydrate();
    } catch (error) {
      notify(error.message || "Could not delete client.", "error");
    } finally {
      setSubmitting("");
    }
  }

  function openEditClient(client) {
    setEditClient(client);
    setClientForm({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      industry: client.industry || "",
      source: client.source || "",
      status: client.status || "active",
      rating: client.rating || 0,
      budget_range_min: client.budget_range_min || "",
      budget_range_max: client.budget_range_max || "",
      timezone: client.timezone || "",
      language: client.language || "en",
      notes: client.notes || "",
      tags: client.tags || "",
      payment_terms: client.payment_terms || "net30"
    });
    setClientDialogOpen(true);
  }

  // Project handlers
  async function handleProjectSubmit(event) {
    event.preventDefault();
    setSubmitting("project");
    try {
      const projectData = {
        ...projectForm,
        client_id: Number(projectForm.client_id),
        budget: projectForm.budget ? Number(projectForm.budget) : null,
        hourly_rate: projectForm.hourly_rate ? Number(projectForm.hourly_rate) : null
      };
      
      if (editProject) {
        await updateProject(editProject.id, projectData, token);
        notify("Project updated.");
      } else {
        await createProject(projectData, token);
        notify("Project created.");
      }
      setProjectForm(defaultProjectForm);
      setEditProject(null);
      setProjectDialogOpen(false);
      await hydrate();
    } catch (submitError) {
      notify(submitError.message || "Could not save project.", "error");
    } finally {
      setSubmitting("");
    }
  }

  function openEditProject(project) {
    setEditProject(project);
    setProjectForm({
      title: project.title || "",
      description: project.description || "",
      status: project.status || "active",
      priority: project.priority || "medium",
      category: project.category || "",
      tags: project.tags || "",
      is_personal: project.is_personal || false,
      is_growth: project.is_growth || false,
      budget: project.budget || "",
      hourly_rate: project.hourly_rate || "",
      currency: project.currency || "USD",
      billing_type: project.billing_type || "hourly",
      start_date: project.start_date || "",
      expected_end_date: project.expected_end_date || "",
      client_id: project.client_id || ""
    });
    setProjectDialogOpen(true);
  }

  async function handleDeleteProject(projectId) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setSubmitting("delete-project");
    try {
      await deleteProject(projectId, token);
      notify("Project deleted.");
      await hydrate();
    } catch (error) {
      notify(error.message || "Could not delete project.", "error");
    } finally {
      setSubmitting("");
    }
  }

  // Task handlers
  async function handleTaskSubmit(event) {
    event.preventDefault();
    if (!selectedProjectId) {
      notify("Select a project first.", "warning");
      return;
    }
    setSubmitting("task");
    try {
      const taskData = {
        ...taskForm,
        project_id: Number(selectedProjectId),
        estimated_hours: taskForm.estimated_hours ? Number(taskForm.estimated_hours) : null
      };
      await createTask(selectedProjectId, taskData, token);
      setTaskForm(defaultTaskForm);
      setTaskDialogOpen(false);
      notify("Task created.");
      await hydrate();
    } catch (submitError) {
      notify(submitError.message || "Could not create task.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleToggleTask(taskId) {
    setSubmitting(`task-toggle-${taskId}`);
    try {
      await toggleTask(taskId, token);
      notify("Task updated.");
      await hydrate();
    } catch (error) {
      notify(error.message || "Could not toggle task.", "error");
    } finally {
      setSubmitting("");
    }
  }

  // Milestone handlers
  async function handleMilestoneSubmit(event) {
    event.preventDefault();
    if (!selectedProjectId) {
      notify("Select a project first.", "warning");
      return;
    }
    setSubmitting("milestone");
    try {
      await createMilestone(selectedProjectId, milestoneForm, token);
      setMilestoneForm(defaultMilestoneForm);
      setMilestoneDialogOpen(false);
      notify("Milestone created.");
      await hydrate();
    } catch (submitError) {
      notify(submitError.message || "Could not create milestone.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleToggleMilestone(milestoneId) {
    setSubmitting(`milestone-toggle-${milestoneId}`);
    try {
      await toggleMilestone(milestoneId, token);
      notify("Milestone updated.");
      await hydrate();
    } catch (error) {
      notify(error.message || "Could not toggle milestone.", "error");
    } finally {
      setSubmitting("");
    }
  }

  // Bug handlers
  async function handleBugSubmit(event) {
    event.preventDefault();
    if (!selectedProjectId) {
      notify("Select a project first.", "warning");
      return;
    }
    setSubmitting("bug");
    try {
      await createBug(selectedProjectId, bugForm, token);
      setBugForm(defaultBugForm);
      setBugDialogOpen(false);
      notify("Bug reported.");
      await hydrate();
    } catch (submitError) {
      notify(submitError.message || "Could not create bug.", "error");
    } finally {
      setSubmitting("");
    }
  }

  // Call handlers
  async function handleCallSubmit(event) {
    event.preventDefault();
    if (!selectedProjectId) {
      notify("Select a project first.", "warning");
      return;
    }
    setSubmitting("call");
    try {
      const callData = {
        ...callForm,
        project_id: Number(selectedProjectId)
      };
      await createCall(callData, token);
      setCallForm(defaultCallForm);
      notify("Call task saved.");
      await hydrate();
    } catch (submitError) {
      notify(submitError.message || "Could not save call.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleToggleCall(callId) {
    setSubmitting(`call-toggle-${callId}`);
    try {
      await toggleCall(callId, token);
      notify("Call status updated.");
      await hydrate();
    } catch (error) {
      notify(error.message || "Could not toggle call.", "error");
    } finally {
      setSubmitting("");
    }
  }

  // Render functions
  function renderOverview() {
    return (
      <Stack spacing={3}>
        <SectionFrame title="Command Pulse" subtitle="A live snapshot of your freelance operation.">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Clients" value={metrics.clientCount} hint="Accounts in your CRM" tone="sea" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Projects Running" value={metrics.activeProjects} hint={`${metrics.projectCount} total`} tone="amber" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Avg Progress" value={`${metrics.averageProgress}%`} hint="Across all projects" tone="moss" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Open Calls" value={metrics.openCalls} hint={`${metrics.overdueCalls} overdue`} tone="rust" />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Total Tasks" value={metrics.totalTasks} hint={`${metrics.completedTasks} done`} tone="sea" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Task Completion" value={`${metrics.taskCompletionRate}%`} hint="Overall completion" tone="moss" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Open Bugs" value={metrics.openBugs} hint={`${metrics.criticalBugs} critical`} tone="rust" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <KpiCard label="Upcoming Milestones" value={metrics.upcomingMilestones} hint="Due in 7 days" tone="amber" />
            </Grid>
          </Grid>
        </SectionFrame>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <SectionFrame title="Project Radar" subtitle="Progress and status by delivery line.">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Project</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length ? (
                    projects.slice(0, 8).map(project => (
                      <TableRow key={project.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>{project.title}</Typography>
                          {project.is_personal && <Chip size="small" label="Personal" sx={{ ml: 1 }} />}
                          {project.is_growth && <Chip size="small" label="Growth" color="secondary" sx={{ ml: 0.5 }} />}
                        </TableCell>
                        <TableCell>#{project.client_id}</TableCell>
                        <TableCell>
                          <Chip size="small" label={project.priority || "medium"} color={priorityColor(project.priority)} variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={project.status || "active"} color={statusColor(project.status)} variant="outlined" />
                        </TableCell>
                        <TableCell sx={{ minWidth: 120 }}>
                          <LinearProgress variant="determinate" value={project.progress || 0} sx={{ height: 8, borderRadius: 10, mb: 0.5 }} />
                          <Typography variant="caption">{project.progress || 0}%</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={5}>No projects yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </SectionFrame>
          </Grid>
          <Grid item xs={12} lg={5}>
            <SectionFrame title="Priority Tasks" subtitle="Tasks requiring attention.">
              <Stack spacing={1}>
                {tasks.length ? (
                  tasks.slice(0, 8).map(task => (
                    <Box key={task.id} sx={{ p: 1.5, borderRadius: 2, border: "1px solid rgba(25,22,17,0.12)", display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: task.is_completed ? "rgba(47,122,74,0.08)" : "transparent" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }} noWrap>{task.title}</Typography>
                        <Typography variant="caption" color="text.secondary">#{task.project_id} • {task.status}</Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Chip size="small" label={task.priority} color={priorityColor(task.priority)} />
                        <Button size="small" onClick={() => handleToggleTask(task.id)} disabled={submitting === `task-toggle-${task.id}`}>
                          {task.is_completed ? "Done" : "Mark"}
                        </Button>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No tasks yet.</Typography>
                )}
              </Stack>
            </SectionFrame>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SectionFrame title="Critical Bugs" subtitle="Bugs requiring immediate attention.">
              <Stack spacing={1}>
                {bugs.filter(b => b.severity === "critical" && b.status !== "closed").length ? (
                  bugs.filter(b => b.severity === "critical" && b.status !== "closed").slice(0, 5).map(bug => (
                    <Box key={bug.id} sx={{ p: 1.5, borderRadius: 2, border: "1px solid rgba(244,67,54,0.3)", bgcolor: "rgba(244,67,54,0.05)" }}>
                      <Typography sx={{ fontWeight: 600 }}>{bug.title}</Typography>
                      <Typography variant="caption" color="text.secondary">#{bug.project_id} • {bug.status}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No critical bugs.</Typography>
                )}
              </Stack>
            </SectionFrame>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionFrame title="Upcoming Milestones" subtitle="Milestones due soon.">
              <Stack spacing={1}>
                {milestones.filter(m => !m.is_completed && m.due_date).length ? (
                  milestones.filter(m => !m.is_completed && m.due_date).slice(0, 5).map(milestone => (
                    <Box key={milestone.id} sx={{ p: 1.5, borderRadius: 2, border: "1px solid rgba(25,22,17,0.12)" }}>
                      <Typography sx={{ fontWeight: 600 }}>{milestone.title}</Typography>
                      <Typography variant="caption" color="text.secondary">#{milestone.project_id} • Due: {milestone.due_date}</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No upcoming milestones.</Typography>
                )}
              </Stack>
            </SectionFrame>
          </Grid>
        </Grid>
      </Stack>
    );
  }

  function renderClients() {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Clients ({filteredClients.length})</Typography>
          <Button variant="contained" startIcon={<GroupRoundedIcon />} onClick={() => { setEditClient(null); setClientForm(defaultClientForm); setClientDialogOpen(true); }}>
            Add Client
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth placeholder="Search clients..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} size="small" />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="prospect">Prospect</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {filteredClients.length ? filteredClients.map(client => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{client.name?.charAt(0).toUpperCase()}</Avatar>
                    <Chip size="small" label={client.status || "active"} color={statusColor(client.status)} />
                  </Box>
                  <Typography variant="h6" gutterBottom>{client.name}</Typography>
                  {client.company && <Typography variant="body2" color="text.secondary">{client.company}</Typography>}
                  {client.email && <Typography variant="body2">{client.email}</Typography>}
                  {client.phone && <Typography variant="body2">{client.phone}</Typography>}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Rating value={client.rating || 0} size="small" readOnly />
                    <Chip size="small" label={client.industry || "N/A"} sx={{ ml: 1 }} />
                  </Box>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={() => openEditClient(client)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteClient(client.id)}>Delete</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Typography color="text.secondary">No clients found.</Typography>
            </Grid>
          )}
        </Grid>

        <Dialog open={clientDialogOpen} onClose={() => setClientDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editClient ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Name *" value={clientForm.name} onChange={e => setClientForm(p => ({ ...p, name: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Company" value={clientForm.company} onChange={e => setClientForm(p => ({ ...p, company: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Email" type="email" value={clientForm.email} onChange={e => setClientForm(p => ({ ...p, email: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Phone" value={clientForm.phone} onChange={e => setClientForm(p => ({ ...p, phone: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={clientForm.status} label="Status" onChange={e => setClientForm(p => ({ ...p, status: e.target.value }))}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="prospect">Prospect</MenuItem>
                    <MenuItem value="on_hold">On Hold</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Industry" value={clientForm.industry} onChange={e => setClientForm(p => ({ ...p, industry: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Source" value={clientForm.source} onChange={e => setClientForm(p => ({ ...p, source: e.target.value }))} placeholder="Referral, Cold outreach, etc." /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Tags" value={clientForm.tags} onChange={e => setClientForm(p => ({ ...p, tags: e.target.value }))} placeholder="VIP, Ongoing, etc." /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Budget Min" type="number" value={clientForm.budget_range_min} onChange={e => setClientForm(p => ({ ...p, budget_range_min: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Budget Max" type="number" value={clientForm.budget_range_max} onChange={e => setClientForm(p => ({ ...p, budget_range_max: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Payment Terms</InputLabel>
                  <Select value={clientForm.payment_terms} label="Payment Terms" onChange={e => setClientForm(p => ({ ...p, payment_terms: e.target.value }))}>
                    <MenuItem value="net15">Net 15</MenuItem>
                    <MenuItem value="net30">Net 30</MenuItem>
                    <MenuItem value="net45">Net 45</MenuItem>
                    <MenuItem value="net60">Net 60</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Timezone" value={clientForm.timezone} onChange={e => setClientForm(p => ({ ...p, timezone: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Notes" multiline rows={3} value={clientForm.notes} onChange={e => setClientForm(p => ({ ...p, notes: e.target.value }))} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClientDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleClientSubmit} variant="contained" disabled={submitting === "client"}>
              {submitting === "client" ? "Saving..." : (editClient ? "Update" : "Create")}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }

  function renderProjects() {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Projects ({filteredProjects.length})</Typography>
          <Button variant="contained" startIcon={<WorkspacesRoundedIcon />} onClick={() => { setEditProject(null); setProjectForm(defaultProjectForm); setProjectDialogOpen(true); }} disabled={!clients.length}>
            New Project
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth placeholder="Search projects..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} size="small" />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={filterPriority} label="Priority" onChange={e => setFilterPriority(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Budget</TableCell>
              <TableCell>Timeline</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProjects.length ? filteredProjects.map(project => (
              <TableRow key={project.id} hover>
                <TableCell>
                  <Typography fontWeight={600}>{project.title}</Typography>
                  <Stack direction="row" spacing={0.5}>
                    {project.is_personal && <Chip size="small" label="Personal" />}
                    {project.is_growth && <Chip size="small" label="Growth" color="secondary" />}
                  </Stack>
                </TableCell>
                <TableCell>#{project.client_id}</TableCell>
                <TableCell><Chip size="small" label={project.priority || "medium"} color={priorityColor(project.priority)} /></TableCell>
                <TableCell><Chip size="small" label={project.status || "active"} color={statusColor(project.status)} /></TableCell>
                <TableCell>{project.budget ? `${project.currency || '$'}${project.budget}` : '-'}</TableCell>
                <TableCell>
                  <Typography variant="caption">{project.start_date || "TBD"} → {project.expected_end_date || "TBD"}</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>
                  <LinearProgress variant="determinate" value={project.progress || 0} sx={{ height: 8, borderRadius: 10, mb: 0.5 }} />
                  <Typography variant="caption">{project.progress || 0}%</Typography>
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => openEditProject(project)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteProject(project.id)}>Delete</Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={8}>No projects found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={projectDialogOpen} onClose={() => setProjectDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>{editProject ? "Edit Project" : "Create New Project"}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}><TextField fullWidth label="Project Title *" value={projectForm.title} onChange={e => setProjectForm(p => ({ ...p, title: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={projectForm.description} onChange={e => setProjectForm(p => ({ ...p, description: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Client</InputLabel>
                  <Select value={projectForm.client_id} label="Client" onChange={e => setProjectForm(p => ({ ...p, client_id: e.target.value }))}>
                    {clients.map(c => <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={projectForm.status} label="Status" onChange={e => setProjectForm(p => ({ ...p, status: e.target.value }))}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="on_hold">On Hold</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={projectForm.priority} label="Priority" onChange={e => setProjectForm(p => ({ ...p, priority: e.target.value }))}>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Billing Type</InputLabel>
                  <Select value={projectForm.billing_type} label="Billing Type" onChange={e => setProjectForm(p => ({ ...p, billing_type: e.target.value }))}>
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="fixed">Fixed Price</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Budget" type="number" value={projectForm.budget} onChange={e => setProjectForm(p => ({ ...p, budget: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={4}><TextField fullWidth label="Hourly Rate" type="number" value={projectForm.hourly_rate} onChange={e => setProjectForm(p => ({ ...p, hourly_rate: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select value={projectForm.currency} label="Currency" onChange={e => setProjectForm(p => ({ ...p, currency: e.target.value }))}>
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Start Date" type="date" value={projectForm.start_date} InputLabelProps={{ shrink: true }} onChange={e => setProjectForm(p => ({ ...p, start_date: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Expected End Date" type="date" value={projectForm.expected_end_date} InputLabelProps={{ shrink: true }} onChange={e => setProjectForm(p => ({ ...p, expected_end_date: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Tags" value={projectForm.tags} onChange={e => setProjectForm(p => ({ ...p, tags: e.target.value }))} placeholder="Comma-separated tags" /></Grid>
              <Grid item xs={12}>
                <FormControlLabel control={<Switch checked={projectForm.is_personal} onChange={e => setProjectForm(p => ({ ...p, is_personal: e.target.checked }))} />} label="Personal Project" />
                <FormControlLabel control={<Switch checked={projectForm.is_growth} onChange={e => setProjectForm(p => ({ ...p, is_growth: e.target.checked }))} />} label="Growth Project" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProjectDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProjectSubmit} variant="contained" disabled={submitting === "project" || !projectForm.client_id}>
              {submitting === "project" ? "Saving..." : (editProject ? "Update" : "Create")}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }

  function renderTasks() {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Tasks ({filteredTasks.length})</Typography>
          <Button variant="contained" startIcon={<AddTaskRoundedIcon />} onClick={() => { setTaskForm(defaultTaskForm); setTaskDialogOpen(true); }} disabled={!projects.length}>
            Add Task
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth placeholder="Search tasks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} size="small" />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={filterPriority} label="Priority" onChange={e => setFilterPriority(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Progress</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTasks.length ? filteredTasks.map(task => (
              <TableRow key={task.id} hover sx={{ bgcolor: task.is_completed ? 'rgba(47,122,74,0.08)' : 'transparent' }}>
                <TableCell><Typography fontWeight={600}>{task.title}</Typography></TableCell>
                <TableCell>#{task.project_id}</TableCell>
                <TableCell><Chip size="small" label={task.status} color={statusColor(task.status)} /></TableCell>
                <TableCell><Chip size="small" label={task.priority} color={priorityColor(task.priority)} /></TableCell>
                <TableCell>{task.due_date || '-'}</TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <LinearProgress variant="determinate" value={task.progress || 0} sx={{ height: 6, borderRadius: 5 }} />
                </TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleToggleTask(task.id)} disabled={submitting === `task-toggle-${task.id}`}>
                    {task.is_completed ? "Reopen" : "Complete"}
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={7}>No tasks found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}><TextField fullWidth label="Task Title *" value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select value={selectedProjectId} label="Project" onChange={e => setSelectedProjectId(e.target.value)}>
                    {projects.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={taskForm.status} label="Status" onChange={e => setTaskForm(p => ({ ...p, status: e.target.value }))}>
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in_progress">In Progress</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={taskForm.priority} label="Priority" onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Due Date" type="date" value={taskForm.due_date} InputLabelProps={{ shrink: true }} onChange={e => setTaskForm(p => ({ ...p, due_date: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Estimated Hours" type="number" value={taskForm.estimated_hours} onChange={e => setTaskForm(p => ({ ...p, estimated_hours: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Tags" value={taskForm.tags} onChange={e => setTaskForm(p => ({ ...p, tags: e.target.value }))} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleTaskSubmit} variant="contained" disabled={submitting === "task"}>
              {submitting === "task" ? "Saving..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }

  function renderMilestones() {
    const projectMilestones = useMemo(() => {
      if (!selectedProjectId) return milestones;
      return milestones.filter(m => m.project_id === Number(selectedProjectId));
    }, [milestones, selectedProjectId]);

    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Milestones</Typography>
          <Button variant="contained" startIcon={<FlagRoundedIcon />} onClick={() => { setMilestoneForm(defaultMilestoneForm); setMilestoneDialogOpen(true); }} disabled={!projects.length}>
            Add Milestone
          </Button>
        </Box>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Project</InputLabel>
          <Select value={selectedProjectId} label="Filter by Project" onChange={e => setSelectedProjectId(e.target.value)}>
            <MenuItem value="">All Projects</MenuItem>
            {projects.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>)}
          </Select>
        </FormControl>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Milestone</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectMilestones.length ? projectMilestones.map(milestone => (
              <TableRow key={milestone.id} hover sx={{ bgcolor: milestone.is_completed ? 'rgba(47,122,74,0.08)' : 'transparent' }}>
                <TableCell><Typography fontWeight={600}>{milestone.title}</Typography></TableCell>
                <TableCell>#{milestone.project_id}</TableCell>
                <TableCell>{milestone.due_date || '-'}</TableCell>
                <TableCell><Chip size="small" label={milestone.status} color={statusColor(milestone.status)} /></TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleToggleMilestone(milestone.id)} disabled={submitting === `milestone-toggle-${milestone.id}`}>
                    {milestone.is_completed ? "Reopen" : "Complete"}
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={5}>No milestones found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={milestoneDialogOpen} onClose={() => setMilestoneDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add Milestone</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select value={selectedProjectId} label="Project" onChange={e => setSelectedProjectId(e.target.value)}>
                    {projects.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Title *" value={milestoneForm.title} onChange={e => setMilestoneForm(p => ({ ...p, title: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={milestoneForm.description} onChange={e => setMilestoneForm(p => ({ ...p, description: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Due Date" type="date" value={milestoneForm.due_date} InputLabelProps={{ shrink: true }} onChange={e => setMilestoneForm(p => ({ ...p, due_date: e.target.value }))} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleMilestoneSubmit} variant="contained" disabled={submitting === "milestone"}>
              {submitting === "milestone" ? "Saving..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }

  function renderBugs() {
    return (
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">Bugs ({bugs.length})</Typography>
          <Button variant="contained" startIcon={<BugReportRoundedIcon />} onClick={() => { setBugForm(defaultBugForm); setBugDialogOpen(true); }} disabled={!projects.length}>
            Report Bug
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField fullWidth placeholder="Search bugs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} size="small" />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={e => setFilterStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Severity</InputLabel>
              <Select value={filterPriority} label="Severity" onChange={e => setFilterPriority(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bug</TableCell>
              <TableCell>Project</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Environment</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bugs.length ? bugs.map(bug => (
              <TableRow key={bug.id} hover>
                <TableCell><Typography fontWeight={600}>{bug.title}</Typography></TableCell>
                <TableCell>#{bug.project_id}</TableCell>
                <TableCell><Chip size="small" label={bug.severity} color={severityColor(bug.severity)} /></TableCell>
                <TableCell><Chip size="small" label={bug.priority} color={priorityColor(bug.priority)} /></TableCell>
                <TableCell><Chip size="small" label={bug.status} color={statusColor(bug.status)} /></TableCell>
                <TableCell>{bug.environment || '-'}</TableCell>
              </TableRow>
            )) : (
              <TableRow><TableCell colSpan={6}>No bugs reported.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>

        <Dialog open={bugDialogOpen} onClose={() => setBugDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Report Bug</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select value={selectedProjectId} label="Project" onChange={e => setSelectedProjectId(e.target.value)}>
                    {projects.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Title *" value={bugForm.title} onChange={e => setBugForm(p => ({ ...p, title: e.target.value }))} /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={bugForm.description} onChange={e => setBugForm(p => ({ ...p, description: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Severity</InputLabel>
                  <Select value={bugForm.severity} label="Severity" onChange={e => setBugForm(p => ({ ...p, severity: e.target.value }))}>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={bugForm.priority} label="Priority" onChange={e => setBugForm(p => ({ ...p, priority: e.target.value }))}>
                    <MenuItem value="p1">P1 - Critical</MenuItem>
                    <MenuItem value="p2">P2 - High</MenuItem>
                    <MenuItem value="p3">P3 - Medium</MenuItem>
                    <MenuItem value="p4">P4 - Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Environment</InputLabel>
                  <Select value={bugForm.environment} label="Environment" onChange={e => setBugForm(p => ({ ...p, environment: e.target.value }))}>
                    <MenuItem value="development">Development</MenuItem>
                    <MenuItem value="staging">Staging</MenuItem>
                    <MenuItem value="production">Production</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}><TextField fullWidth label="Steps to Reproduce" multiline rows={3} value={bugForm.steps_to_reproduce} onChange={e => setBugForm(p => ({ ...p, steps_to_reproduce: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Expected Behavior" value={bugForm.expected_behavior} onChange={e => setBugForm(p => ({ ...p, expected_behavior: e.target.value }))} /></Grid>
              <Grid item xs={12} sm={6}><TextField fullWidth label="Actual Behavior" value={bugForm.actual_behavior} onChange={e => setBugForm(p => ({ ...p, actual_behavior: e.target.value }))} /></Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBugDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBugSubmit} variant="contained" disabled={submitting === "bug"}>
              {submitting === "bug" ? "Saving..." : "Report Bug"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  }

  function renderCalls() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <SectionFrame title="Schedule Call" subtitle="Plan a call or follow-up.">
            <Box component="form" onSubmit={handleCallSubmit}>
              <Stack spacing={1.5}>
                <FormControl fullWidth required>
                  <InputLabel>Project</InputLabel>
                  <Select value={selectedProjectId} label="Project" onChange={e => setSelectedProjectId(e.target.value)}>
                    {projects.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField required fullWidth label="Call Title" value={callForm.title} onChange={e => setCallForm(p => ({ ...p, title: e.target.value }))} />
                <TextField fullWidth label="Notes" multiline rows={3} value={callForm.notes} onChange={e => setCallForm(p => ({ ...p, notes: e.target.value }))} />
                <Grid container spacing={2}>
                  <Grid item xs={6}><TextField fullWidth label="Scheduled At" type="datetime-local" value={callForm.scheduled_at} InputLabelProps={{ shrink: true }} onChange={e => setCallForm(p => ({ ...p, scheduled_at: e.target.value }))} /></Grid>
                  <Grid item xs={6}><TextField fullWidth label="Duration (min)" type="number" value={callForm.duration} onChange={e => setCallForm(p => ({ ...p, duration: e.target.value }))} /></Grid>
                </Grid>
                <FormControl fullWidth>
                  <InputLabel>Call Type</InputLabel>
                  <Select value={callForm.call_type} label="Call Type" onChange={e => setCallForm(p => ({ ...p, call_type: e.target.value }))}>
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="discovery">Discovery</MenuItem>
                    <MenuItem value="follow_up">Follow-up</MenuItem>
                    <MenuItem value="retro">Retrospective</MenuItem>
                    <MenuItem value="standup">Standup</MenuItem>
                  </Select>
                </FormControl>
                <Button type="submit" variant="contained" startIcon={<CallRoundedIcon />} disabled={submitting === "call" || !selectedProjectId}>
                  {submitting === "call" ? "Saving..." : "Schedule Call"}
                </Button>
              </Stack>
            </Box>
          </SectionFrame>
        </Grid>
        <Grid item xs={12} lg={7}>
          <SectionFrame title="Call Queue" subtitle={selectedProjectId ? `Project #${selectedProjectId} calls` : "Select a project"}>
            <FormControl sx={{ mb: 2, minWidth: 200 }}>
              <InputLabel>Filter by Project</InputLabel>
              <Select value={selectedProjectId} label="Filter by Project" onChange={e => setSelectedProjectId(e.target.value)}>
                <MenuItem value="">All Projects</MenuItem>
                {projects.map(p => <MenuItem key={p.id} value={String(p.id)}>{p.title}</MenuItem>)}
              </Select>
            </FormControl>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProjectCalls.length ? selectedProjectCalls.map(call => (
                  <TableRow key={call.id} hover>
                    <TableCell><Typography fontWeight={600}>{call.title}</Typography></TableCell>
                    <TableCell>{call.call_type}</TableCell>
                    <TableCell>{call.scheduled_at ? new Date(call.scheduled_at).toLocaleString() : '-'}</TableCell>
                    <TableCell><Chip size="small" color={call.completed ? "success" : "warning"} label={call.completed ? "Completed" : "Pending"} /></TableCell>
                    <TableCell><Button size="small" onClick={() => handleToggleCall(call.id)} disabled={submitting === `call-toggle-${call.id}`}>Toggle</Button></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5}>No calls for this project.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </SectionFrame>
        </Grid>
      </Grid>
    );
  }

  function renderBody() {
    switch (section) {
      case "clients": return renderClients();
      case "projects": return renderProjects();
      case "tasks": return renderTasks();
      case "milestones": return renderMilestones();
      case "bugs": return renderBugs();
      case "calls": return renderCalls();
      default: return renderOverview();
    }
  }

  return (
    <AppShell sections={sectionConfig} activeSection={section} onSectionChange={setSection} title="Freelance CRM" subtitle="Mega-App Command Deck" userEmail={email} onLogout={onLogout}>
      <Stack spacing={3}>
        <Box sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid rgba(25,22,17,0.12)", background: "linear-gradient(120deg, rgba(21,94,99,0.14) 0%, rgba(180,73,21,0.12) 55%, rgba(251,248,239,1) 100%)" }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'IBM Plex Mono', monospace" }}>OPERATIONS SNAPSHOT</Typography>
              <Typography variant="h3">Freelance Control Room</Typography>
              <Typography variant="body2" color="text.secondary">Your mega-app for clients, projects, tasks, bugs, and more.</Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip icon={<InsightsRoundedIcon />} label={`${metrics.projectCount} projects`} />
              <Chip icon={<CallRoundedIcon />} label={`${metrics.openCalls} calls`} />
              <Chip icon={<BugReportRoundedIcon />} label={`${metrics.openBugs} bugs`} />
            </Stack>
          </Stack>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">Loading workspace data...</Typography>
          </Box>
        ) : null}

        {error ? <Alert severity="error">{error}</Alert> : null}

        {renderBody()}
      </Stack>

      <Snackbar open={snack.open} autoHideDuration={2600} onClose={() => setSnack(p => ({ ...p, open: false }))}>
        <Alert variant="filled" severity={snack.severity} onClose={() => setSnack(p => ({ ...p, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
