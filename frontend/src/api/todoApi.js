import { request } from "./http";

// Personal Todo APIs
export async function createTodo(todoData, token) {
  return request("/todos/", { method: "POST", body: todoData, token });
}

export async function listTodos(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/todos?${queryString}` : "/todos";
  return request(path, { method: "GET", token });
}

export async function getTodo(todoId, token) {
  return request(`/todos/${todoId}`, { method: "GET", token });
}

export async function updateTodo(todoId, todoData, token) {
  return request(`/todos/${todoId}`, { method: "PATCH", body: todoData, token });
}

export async function deleteTodo(todoId, token) {
  return request(`/todos/${todoId}`, { method: "DELETE", token });
}

export async function toggleTodo(todoId, token) {
  return request(`/todos/${todoId}/toggle`, { method: "PATCH", token });
}

// Filtered lists
export async function listWaitingTodos(token) {
  return request("/todos?is_waiting=true", { method: "GET", token });
}

export async function listSomedayTodos(token) {
  return request("/todos?is_someday=true", { method: "GET", token });
}

export async function listTodaysTodos(token) {
  const today = new Date().toISOString().split('T')[0];
  return request(`/todos?due_date=${today}`, { method: "GET", token });
}

