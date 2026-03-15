import { request } from "./http";

export async function listNotifications(token) {
  return request("/notifications", { method: "GET", token });
}

export async function markAsRead(notificationId, token) {
  return request(`/notifications/${notificationId}/read`, { method: "PATCH", token });
}

export async function refreshNotifications(token) {
  return request("/notifications/refresh", { method: "POST", token });
}
