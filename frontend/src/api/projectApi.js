import { request } from "./http";

// Project APIs
export async function createProject(projectData, token) {
  return request("/projects", { method: "POST", body: projectData, token });
}

export async function listProjects(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/projects?${queryString}` : "/projects";
  return request(path, { method: "GET", token });
}

export async function searchProjects(q, token) {
  return request(`/projects/search?q=${encodeURIComponent(q)}`, { method: "GET", token });
}

export async function getProject(projectId, token) {
  return request(`/projects/${projectId}`, { method: "GET", token });
}

export async function getProjectDetail(projectId, token) {
  return request(`/projects/${projectId}/detail`, { method: "GET", token });
}

export async function updateProject(projectId, projectData, token) {
  return request(`/projects/${projectId}`, { method: "PATCH", body: projectData, token });
}

export async function deleteProject(projectId, token) {
  return request(`/projects/${projectId}`, { method: "DELETE", token });
}

export async function cloneProject(projectId, newTitle, token) {
  return request(`/projects/${projectId}/clone?new_title=${encodeURIComponent(newTitle)}`, { method: "POST", token });
}

export async function getProjectAnalytics(projectId, token) {
  return request(`/projects/${projectId}/analytics`, { method: "GET", token });
}

// Phase APIs
export async function createPhase(projectId, phaseData, token) {
  return request(`/projects/${projectId}/phases`, { method: "POST", body: phaseData, token });
}

export async function listPhases(projectId, token) {
  return request(`/projects/${projectId}/phases`, { method: "GET", token });
}

export async function updatePhase(phaseId, phaseData, token) {
  return request(`/projects/phases/${phaseId}`, { method: "PATCH", body: phaseData, token });
}

export async function togglePhase(phaseId, token) {
  return request(`/projects/phases/${phaseId}/toggle`, { method: "PATCH", token });
}

export async function deletePhase(phaseId, token) {
  return request(`/projects/phases/${phaseId}`, { method: "DELETE", token });
}

// Task APIs
export async function createTask(projectId, taskData, token) {
  return request(`/projects/${projectId}/tasks`, { method: "POST", body: taskData, token });
}

export async function listTasks(projectId, token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/projects/${projectId}/tasks?${queryString}` : `/projects/${projectId}/tasks`;
  return request(path, { method: "GET", token });
}

export async function listAllTasks(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/projects/tasks/all?${queryString}` : "/projects/tasks/all";
  return request(path, { method: "GET", token });
}

export async function getTask(taskId, token) {
  return request(`/projects/tasks/${taskId}`, { method: "GET", token });
}

export async function updateTask(taskId, taskData, token) {
  return request(`/projects/tasks/${taskId}`, { method: "PATCH", body: taskData, token });
}

export async function toggleTask(taskId, token) {
  return request(`/projects/tasks/${taskId}/toggle`, { method: "PATCH", token });
}

export async function deleteTask(taskId, token) {
  return request(`/projects/tasks/${taskId}`, { method: "DELETE", token });
}

// Milestone APIs
export async function createMilestone(projectId, milestoneData, token) {
  return request(`/projects/${projectId}/milestones`, { method: "POST", body: milestoneData, token });
}

export async function listMilestones(projectId, token) {
  return request(`/projects/${projectId}/milestones`, { method: "GET", token });
}

export async function listAllMilestones(token) {
  return request("/projects/milestones/all", { method: "GET", token });
}

export async function updateMilestone(milestoneId, milestoneData, token) {
  return request(`/projects/milestones/${milestoneId}`, { method: "PATCH", body: milestoneData, token });
}

export async function toggleMilestone(milestoneId, token) {
  return request(`/projects/milestones/${milestoneId}/toggle`, { method: "PATCH", token });
}

export async function deleteMilestone(milestoneId, token) {
  return request(`/projects/milestones/${milestoneId}`, { method: "DELETE", token });
}

// Bug APIs
export async function createBug(projectId, bugData, token) {
  return request(`/projects/${projectId}/bugs`, { method: "POST", body: bugData, token });
}

export async function listBugs(projectId, token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/projects/${projectId}/bugs?${queryString}` : `/projects/${projectId}/bugs`;
  return request(path, { method: "GET", token });
}

export async function listAllBugs(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/projects/bugs/all?${queryString}` : "/projects/bugs/all";
  return request(path, { method: "GET", token });
}

export async function getBug(bugId, token) {
  return request(`/projects/bugs/${bugId}`, { method: "GET", token });
}

export async function updateBug(bugId, bugData, token) {
  return request(`/projects/bugs/${bugId}`, { method: "PATCH", body: bugData, token });
}

export async function deleteBug(bugId, token) {
  return request(`/projects/bugs/${bugId}`, { method: "DELETE", token });
}

