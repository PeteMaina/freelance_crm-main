import { request } from "./http";

export function listProjects(token) {
  return request("/projects/", { token });
}

export function createProject(payload, token) {
  return request("/projects/", {
    method: "POST",
    body: payload,
    token
  });
}

export function togglePhase(phaseId, token) {
  return request(`/projects/phase/${phaseId}`, {
    method: "PATCH",
    token
  });
}
