import { request } from "./http";

export function listClients(token) {
  return request("/clients/", { token });
}

export function createClient(payload, token) {
  return request("/clients/", {
    method: "POST",
    body: payload,
    token
  });
}
