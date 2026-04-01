import { API_BASE_URL } from "./http";

// Reuse the app's existing API base URL so the portal keeps working
// with the same Netlify environment variable the frontend already uses.
const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

export async function checkPortalToken(token) {
  const response = await fetch(`${API_URL}/portal/check-token/${token}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Invalid magic link");
  }
  return response.json();
}

export async function loginPortal(data) {
  const response = await fetch(`${API_URL}/portal/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Login failed");
  }
  return response.json();
}

export async function getPortalProjects(token) {
  const response = await fetch(`${API_URL}/portal/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

export async function getPortalBugs(token, projectId) {
  const response = await fetch(`${API_URL}/portal/projects/${projectId}/bugs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch bugs");
  return response.json();
}

export async function createPortalBug(token, projectId, bugData) {
  const response = await fetch(`${API_URL}/portal/projects/${projectId}/bugs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bugData),
  });
  if (!response.ok) throw new Error("Failed to report bug");
  return response.json();
}
