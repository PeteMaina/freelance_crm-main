import { request } from "./http";

export function registerUser(payload) {
  return request("/auth/register", {
    method: "POST",
    body: payload
  });
}

export function loginUser(payload) {
  return request("/auth/login", {
    method: "POST",
    body: payload
  });
}
