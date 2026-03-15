import { request } from "./http";

// Sprint APIs
export async function createSprint(projectId, sprintData, token) {
  return request(`/sprints/`, { method: "POST", body: { ...sprintData, project_id: projectId }, token });
}

export async function listSprints(token, projectId = null) {
  const path = projectId ? `/sprints?project_id=${projectId}` : "/sprints";
  return request(path, { method: "GET", token });
}

export async function getSprint(sprintId, token) {
  return request(`/sprints/${sprintId}`, { method: "GET", token });
}

export async function updateSprint(sprintId, sprintData, token) {
  return request(`/sprints/${sprintId}`, { method: "PATCH", body: sprintData, token });
}

export async function deleteSprint(sprintId, token) {
  return request(`/sprints/${sprintId}`, { method: "DELETE", token });
}

export async function startSprint(sprintId, token) {
  return request(`/sprints/${sprintId}`, { method: "PATCH", body: { status: "active" }, token });
}

export async function completeSprint(sprintId, token) {
  return request(`/sprints/${sprintId}`, { method: "PATCH", body: { status: "completed" }, token });
}

