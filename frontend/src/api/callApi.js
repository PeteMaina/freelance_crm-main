import { request } from "./http";

export function listCalls(projectId, token) {
  return request(`/calls/${projectId}`, { token });
}

export function createCall(payload, token) {
  return request("/calls/", {
    method: "POST",
    body: payload,
    token
  });
}

export function toggleCall(callId, token) {
  return request(`/calls/${callId}`, {
    method: "PATCH",
    token
  });
}
