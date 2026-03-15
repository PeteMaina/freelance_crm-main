import { request } from "./http";

export function listCalls(token, projectId = null) {
  const path = projectId ? `/calls?project_id=${projectId}` : "/calls";
  return request(path, { token });
}

export function createCall(payload, token) {
  return request("/calls", {
    method: "POST",
    body: payload,
    token
  });
}

export function toggleCall(callId, token) {
  return request(`/calls/${callId}/toggle`, {
    method: "PATCH",
    token
  });
}

export function getUpcomingCalls(token) {
  return request("/calls/upcoming", { token });
}

export function getOverdueCalls(token) {
  return request("/calls/overdue", { token });
}

// Sprint APIs
export function createSprint(sprintData, token) {
  return request("/sprints", {
    method: "POST",
    body: sprintData,
    token
  });
}

export function listSprints(token, projectId = null) {
  const path = projectId ? `/sprints?project_id=${projectId}` : "/sprints";
  return request(path, { token });
}

export function getSprint(sprintId, token) {
  return request(`/sprints/${sprintId}`, { method: "GET", token });
}

export function updateSprint(sprintId, sprintData, token) {
  return request(`/sprints/${sprintId}`, {
    method: "PATCH",
    body: sprintData,
    token
  });
}

export function deleteSprint(sprintId, token) {
  return request(`/sprints/${sprintId}`, {
    method: "DELETE",
    token
  });
}

// Personal TODO APIs
export function createPersonalTodo(todoData, token) {
  return request("/todos", {
    method: "POST",
    body: todoData,
    token
  });
}

export function listPersonalTodos(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/todos?${queryString}` : "/todos";
  return request(path, { token });
}

export function getPersonalTodo(todoId, token) {
  return request(`/todos/${todoId}`, { method: "GET", token });
}

export function updatePersonalTodo(todoId, todoData, token) {
  return request(`/todos/${todoId}`, {
    method: "PATCH",
    body: todoData,
    token
  });
}

export function togglePersonalTodo(todoId, token) {
  return request(`/todos/${todoId}/toggle`, {
    method: "PATCH",
    token
  });
}

export function deletePersonalTodo(todoId, token) {
  return request(`/todos/${todoId}`, {
    method: "DELETE",
    token
  });
}
