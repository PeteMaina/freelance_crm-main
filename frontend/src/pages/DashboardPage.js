import AddTaskRoundedIcon from "@mui/icons-material/AddTaskRounded";
import CallRoundedIcon from "@mui/icons-material/CallRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
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
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { createCall, listCalls, toggleCall } from "../api/callApi";
import { createClient, listClients } from "../api/clientApi";
import { createProject, listProjects, togglePhase } from "../api/projectApi";
import AppShell from "../components/AppShell";
import KpiCard from "../components/KpiCard";
import SectionFrame from "../components/SectionFrame";

const sectionConfig = [
  { key: "overview", label: "Overview", hint: "Live health indicators" },
  { key: "clients", label: "Clients", hint: "Client intake and list" },
  { key: "projects", label: "Projects", hint: "Execution and progress" },
  { key: "calls", label: "Calls", hint: "Follow-ups and cadence" }
];

const defaultClientForm = {
  name: "",
  email: "",
  phone: ""
};

const defaultProjectForm = {
  title: "",
  description: "",
  status: "active",
  start_date: "",
  expected_end_date: "",
  client_id: ""
};

const defaultCallForm = {
  title: "",
  notes: ""
};

function statusColor(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("active")) {
    return "success";
  }
  if (normalized.includes("hold")) {
    return "warning";
  }
  if (normalized.includes("done") || normalized.includes("complete")) {
    return "default";
  }
  return "primary";
}

export default function DashboardPage({ token, email, onLogout }) {
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState("");
  const [error, setError] = useState("");

  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [callsByProject, setCallsByProject] = useState({});
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [clientForm, setClientForm] = useState(defaultClientForm);
  const [projectForm, setProjectForm] = useState(defaultProjectForm);
  const [callForm, setCallForm] = useState(defaultCallForm);
  const [phaseIdInput, setPhaseIdInput] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  const allCalls = useMemo(() => {
    return Object.values(callsByProject).flat();
  }, [callsByProject]);

  const selectedProjectCalls = useMemo(() => {
    if (!selectedProjectId) {
      return [];
    }
    return callsByProject[selectedProjectId] || [];
  }, [callsByProject, selectedProjectId]);

  const metrics = useMemo(() => {
    const activeProjects = projects.filter((project) =>
      String(project.status || "").toLowerCase().includes("active")
    ).length;
    const totalProgress = projects.reduce((sum, project) => sum + (project.progress || 0), 0);
    const averageProgress = projects.length ? Math.round(totalProgress / projects.length) : 0;
    const openCalls = allCalls.filter((item) => !item.completed).length;

    return {
      clientCount: clients.length,
      projectCount: projects.length,
      activeProjects,
      averageProgress,
      openCalls
    };
  }, [clients, projects, allCalls]);

  useEffect(() => {
    void hydrate();
  }, [token]);

  function notify(message, severity = "success") {
    setSnack({
      open: true,
      severity,
      message
    });
  }

  async function hydrate() {
    setLoading(true);
    setError("");
    try {
      const [clientData, projectData] = await Promise.all([listClients(token), listProjects(token)]);

      const safeClients = clientData || [];
      const safeProjects = projectData || [];
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

      setClients(safeClients);
      setProjects(safeProjects);
      setCallsByProject(callsMap);
      setSelectedProjectId((previous) => {
        if (previous && callsMap[previous]) {
          return previous;
        }
        return safeProjects.length ? String(safeProjects[0].id) : "";
      });
    } catch (hydrateError) {
      setError(hydrateError.message || "Could not load CRM data.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshProjectsOnly() {
    const projectData = await listProjects(token);
    setProjects(projectData || []);
  }

  async function handleClientSubmit(event) {
    event.preventDefault();
    setSubmitting("client");
    try {
      const created = await createClient(clientForm, token);
      setClients((previous) => [...previous, created]);
      setClientForm(defaultClientForm);
      notify("Client added.");
    } catch (submitError) {
      notify(submitError.message || "Could not create client.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleProjectSubmit(event) {
    event.preventDefault();
    setSubmitting("project");
    try {
      await createProject(
        {
          title: projectForm.title,
          description: projectForm.description || null,
          status: projectForm.status,
          start_date: projectForm.start_date || null,
          expected_end_date: projectForm.expected_end_date || null,
          client_id: Number(projectForm.client_id)
        },
        token
      );
      setProjectForm(defaultProjectForm);
      await hydrate();
      setSection("projects");
      notify("Project created and phase pipeline initialized.");
    } catch (submitError) {
      notify(submitError.message || "Could not create project.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleCallSubmit(event) {
    event.preventDefault();
    if (!selectedProjectId) {
      notify("Select a project first.", "warning");
      return;
    }

    setSubmitting("call");
    try {
      const created = await createCall(
        {
          ...callForm,
          project_id: Number(selectedProjectId)
        },
        token
      );

      setCallsByProject((previous) => ({
        ...previous,
        [selectedProjectId]: [...(previous[selectedProjectId] || []), created]
      }));
      setCallForm(defaultCallForm);
      notify("Call task saved.");
    } catch (submitError) {
      notify(submitError.message || "Could not save call.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleToggleCall(callId) {
    setSubmitting(`call-toggle-${callId}`);
    try {
      const updated = await toggleCall(callId, token);
      const projectKey = String(updated.project_id);
      setCallsByProject((previous) => ({
        ...previous,
        [projectKey]: (previous[projectKey] || []).map((item) => {
          if (item.id === updated.id) {
            return updated;
          }
          return item;
        })
      }));
      notify("Call status updated.");
    } catch (toggleError) {
      notify(toggleError.message || "Could not toggle call.", "error");
    } finally {
      setSubmitting("");
    }
  }

  async function handleTogglePhase() {
    const phaseId = Number(phaseIdInput);
    if (!phaseId) {
      notify("Enter a valid phase ID.", "warning");
      return;
    }

    setSubmitting("phase");
    try {
      await togglePhase(phaseId, token);
      setPhaseIdInput("");
      await refreshProjectsOnly();
      notify(`Phase ${phaseId} toggled.`);
    } catch (phaseError) {
      notify(phaseError.message || "Could not toggle phase.", "error");
    } finally {
      setSubmitting("");
    }
  }

  function renderOverview() {
    return (
      <Stack spacing={3}>
        <SectionFrame
          title="Command Pulse"
          subtitle="A live snapshot of your freelance operation."
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <KpiCard
                label="Total Clients"
                value={metrics.clientCount}
                hint="How many accounts are in your pipeline"
                tone="sea"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <KpiCard
                label="Projects Running"
                value={metrics.activeProjects}
                hint={`${metrics.projectCount} projects in total`}
                tone="amber"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <KpiCard
                label="Average Progress"
                value={`${metrics.averageProgress}%`}
                hint="Across every project currently tracked"
                tone="moss"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <KpiCard
                label="Open Calls"
                value={metrics.openCalls}
                hint="Pending communication tasks"
                tone="rust"
              />
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
                    <TableCell>Client ID</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length ? (
                    projects.map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>{project.client_id}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status || "active"}
                            size="small"
                            color={statusColor(project.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 160 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress || 0}
                            sx={{ height: 8, borderRadius: 10, mb: 0.75 }}
                          />
                          <Typography variant="caption">{project.progress || 0}%</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4}>No projects yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </SectionFrame>
          </Grid>
          <Grid item xs={12} lg={5}>
            <SectionFrame
              title="Priority Calls"
              subtitle="The next communication actions across projects."
            >
              <Stack spacing={1.25}>
                {allCalls.length ? (
                  allCalls.slice(0, 8).map((callItem) => (
                    <Box
                      key={callItem.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px solid rgba(25,22,17,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        bgcolor: callItem.completed ? "rgba(47,122,74,0.08)" : "transparent"
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700 }} noWrap>
                          {callItem.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Project #{callItem.project_id}
                        </Typography>
                      </Box>
                      <Chip
                        label={callItem.completed ? "Completed" : "Pending"}
                        size="small"
                        color={callItem.completed ? "success" : "warning"}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Calls will appear here once you create them.
                  </Typography>
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
      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <SectionFrame title="Add Client" subtitle="Register new accounts quickly.">
            <Box component="form" onSubmit={handleClientSubmit}>
              <Stack spacing={1.5}>
                <TextField
                  required
                  label="Client Name"
                  value={clientForm.name}
                  onChange={(event) =>
                    setClientForm((previous) => ({ ...previous, name: event.target.value }))
                  }
                />
                <TextField
                  label="Email"
                  type="email"
                  value={clientForm.email}
                  onChange={(event) =>
                    setClientForm((previous) => ({ ...previous, email: event.target.value }))
                  }
                />
                <TextField
                  label="Phone"
                  value={clientForm.phone}
                  onChange={(event) =>
                    setClientForm((previous) => ({ ...previous, phone: event.target.value }))
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<GroupRoundedIcon />}
                  disabled={submitting === "client"}
                >
                  {submitting === "client" ? "Saving..." : "Create Client"}
                </Button>
              </Stack>
            </Box>
          </SectionFrame>
        </Grid>
        <Grid item xs={12} lg={8}>
          <SectionFrame title="Client Ledger" subtitle={`${clients.length} clients in your CRM.`}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.length ? (
                  clients.map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>{client.id}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.email || "-"}</TableCell>
                      <TableCell>{client.phone || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>No clients yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SectionFrame>
        </Grid>
      </Grid>
    );
  }

  function renderProjects() {
    return (
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={5}>
            <SectionFrame title="Create Project" subtitle="Every project starts with a mapped client.">
              <Box component="form" onSubmit={handleProjectSubmit}>
                <Stack spacing={1.5}>
                  <TextField
                    required
                    label="Project Title"
                    value={projectForm.title}
                    onChange={(event) =>
                      setProjectForm((previous) => ({ ...previous, title: event.target.value }))
                    }
                  />
                  <TextField
                    label="Description"
                    multiline
                    minRows={3}
                    value={projectForm.description}
                    onChange={(event) =>
                      setProjectForm((previous) => ({ ...previous, description: event.target.value }))
                    }
                  />
                  <FormControl fullWidth required>
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      value={projectForm.status}
                      label="Status"
                      onChange={(event) =>
                        setProjectForm((previous) => ({ ...previous, status: event.target.value }))
                      }
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="on_hold">On Hold</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel id="client-select-label">Client</InputLabel>
                    <Select
                      labelId="client-select-label"
                      value={projectForm.client_id}
                      label="Client"
                      onChange={(event) =>
                        setProjectForm((previous) => ({ ...previous, client_id: event.target.value }))
                      }
                    >
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={String(client.id)}>
                          #{client.id} - {client.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Start Date"
                    type="date"
                    value={projectForm.start_date}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      setProjectForm((previous) => ({ ...previous, start_date: event.target.value }))
                    }
                  />
                  <TextField
                    label="Expected End Date"
                    type="date"
                    value={projectForm.expected_end_date}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      setProjectForm((previous) => ({
                        ...previous,
                        expected_end_date: event.target.value
                      }))
                    }
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<WorkspacesRoundedIcon />}
                    disabled={submitting === "project" || !clients.length}
                  >
                    {submitting === "project" ? "Saving..." : "Create Project"}
                  </Button>
                </Stack>
              </Box>
            </SectionFrame>
          </Grid>
          <Grid item xs={12} lg={7}>
            <SectionFrame
              title="Project Ledger"
              subtitle="Progress is calculated from phase completion in the backend."
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Dates</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.length ? (
                    projects.map((project) => (
                      <TableRow key={project.id} hover>
                        <TableCell>{project.id}</TableCell>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status || "active"}
                            size="small"
                            color={statusColor(project.status)}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" component="div">
                            {project.start_date || "n/a"} {" -> "} {project.expected_end_date || "n/a"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 140 }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progress || 0}
                            sx={{ height: 8, borderRadius: 10, mb: 0.75 }}
                          />
                          <Typography variant="caption">{project.progress || 0}%</Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5}>No projects yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </SectionFrame>
          </Grid>
        </Grid>

        <SectionFrame
          title="Phase Switch"
          subtitle="Backend exposes phase toggle by phase ID. Enter a phase ID to toggle completion."
          actions={
            <Button
              variant="outlined"
              onClick={handleTogglePhase}
              startIcon={<AddTaskRoundedIcon />}
              disabled={submitting === "phase"}
            >
              {submitting === "phase" ? "Updating..." : "Toggle Phase"}
            </Button>
          }
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
            <TextField
              label="Phase ID"
              value={phaseIdInput}
              onChange={(event) => setPhaseIdInput(event.target.value)}
              sx={{ maxWidth: 260 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
              Phase IDs are generated in order when projects are created.
            </Typography>
          </Stack>
        </SectionFrame>
      </Stack>
    );
  }

  function renderCalls() {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <SectionFrame title="Create Call Task" subtitle="Capture every follow-up before it slips.">
            <Box component="form" onSubmit={handleCallSubmit}>
              <Stack spacing={1.5}>
                <FormControl fullWidth required>
                  <InputLabel id="project-call-select-label">Project</InputLabel>
                  <Select
                    labelId="project-call-select-label"
                    value={selectedProjectId}
                    label="Project"
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={String(project.id)}>
                        #{project.id} - {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  required
                  label="Call Title"
                  value={callForm.title}
                  onChange={(event) =>
                    setCallForm((previous) => ({ ...previous, title: event.target.value }))
                  }
                />
                <TextField
                  label="Notes"
                  multiline
                  minRows={3}
                  value={callForm.notes}
                  onChange={(event) =>
                    setCallForm((previous) => ({ ...previous, notes: event.target.value }))
                  }
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<CallRoundedIcon />}
                  disabled={submitting === "call" || !selectedProjectId}
                >
                  {submitting === "call" ? "Saving..." : "Create Call"}
                </Button>
              </Stack>
            </Box>
          </SectionFrame>
        </Grid>
        <Grid item xs={12} lg={7}>
          <SectionFrame
            title="Call Queue"
            subtitle={
              selectedProjectId
                ? `Project #${selectedProjectId} call list`
                : "Select a project to view call list"
            }
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProjectCalls.length ? (
                  selectedProjectCalls.map((callItem) => (
                    <TableRow key={callItem.id} hover>
                      <TableCell>{callItem.id}</TableCell>
                      <TableCell>{callItem.title}</TableCell>
                      <TableCell>{callItem.notes || "-"}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          color={callItem.completed ? "success" : "warning"}
                          label={callItem.completed ? "Completed" : "Pending"}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleToggleCall(callItem.id)}
                          disabled={submitting === `call-toggle-${callItem.id}`}
                        >
                          {submitting === `call-toggle-${callItem.id}` ? "..." : "Toggle"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>No calls yet for this project.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </SectionFrame>
        </Grid>
      </Grid>
    );
  }

  function renderBody() {
    if (section === "clients") {
      return renderClients();
    }
    if (section === "projects") {
      return renderProjects();
    }
    if (section === "calls") {
      return renderCalls();
    }
    return renderOverview();
  }

  return (
    <AppShell
      sections={sectionConfig}
      activeSection={section}
      onSectionChange={setSection}
      title="Freelance CRM"
      subtitle="Command Deck"
      userEmail={email}
      onLogout={onLogout}
    >
      <Stack spacing={3}>
        <Box
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: "1px solid rgba(25,22,17,0.12)",
            background:
              "linear-gradient(120deg, rgba(21,94,99,0.14) 0%, rgba(180,73,21,0.12) 55%, rgba(251,248,239,1) 100%)"
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                OPERATIONS SNAPSHOT
              </Typography>
              <Typography variant="h3">Freelance Control Room</Typography>
              <Typography variant="body2" color="text.secondary">
                Keep every client engagement and project milestone visible.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip icon={<InsightsRoundedIcon />} label={`${metrics.projectCount} projects`} />
              <Chip icon={<CallRoundedIcon />} label={`${metrics.openCalls} open calls`} />
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

      <Snackbar
        open={snack.open}
        autoHideDuration={2600}
        onClose={() => setSnack((previous) => ({ ...previous, open: false }))}
      >
        <Alert
          variant="filled"
          severity={snack.severity}
          onClose={() => setSnack((previous) => ({ ...previous, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </AppShell>
  );
}
