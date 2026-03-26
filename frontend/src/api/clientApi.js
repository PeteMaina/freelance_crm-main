import { request } from "./http";

// Client APIs
export async function createClient(clientData, token) {
  return request("/clients", { method: "POST", body: clientData, token });
}

export async function listClients(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/clients?${queryString}` : "/clients";
  return request(path, { method: "GET", token });
}

export async function searchClients(q, token) {
  return request(`/clients/search?q=${encodeURIComponent(q)}`, { method: "GET", token });
}

export async function getClient(clientId, token) {
  return request(`/clients/${clientId}`, { method: "GET", token });
}

export async function getClientDetail(clientId, token) {
  return request(`/clients/${clientId}/detail`, { method: "GET", token });
}

export async function updateClient(clientId, clientData, token) {
  return request(`/clients/${clientId}`, { method: "PATCH", body: clientData, token });
}

export async function deleteClient(clientId, token) {
  return request(`/clients/${clientId}`, { method: "DELETE", token });
}

export async function getClientMetrics(clientId, token) {
  return request(`/clients/${clientId}/metrics`, { method: "GET", token });
}

export async function exportClient(clientId, token) {
  return request(`/clients/${clientId}/export`, { method: "GET", token });
}

// Contact APIs
export async function createContact(clientId, contactData, token) {
  return request(`/clients/${clientId}/contacts`, { method: "POST", body: contactData, token });
}

export async function listContacts(clientId, token) {
  return request(`/clients/${clientId}/contacts`, { method: "GET", token });
}

export async function deleteContact(contactId, token) {
  return request(`/clients/contacts/${contactId}`, { method: "DELETE", token });
}

// Contract APIs
export async function createContract(clientId, contractData, token) {
  return request(`/clients/${clientId}/contracts`, { method: "POST", body: contractData, token });
}

export async function listContracts(clientId, token) {
  return request(`/clients/${clientId}/contracts`, { method: "GET", token });
}

// Invoice APIs
export async function createInvoice(invoiceData, token) {
  return request("/clients/invoices", { method: "POST", body: invoiceData, token });
}

export async function listInvoices(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/clients/invoices?${queryString}` : "/clients/invoices";
  return request(path, { method: "GET", token });
}

export async function getInvoice(invoiceId, token) {
  return request(`/clients/invoices/${invoiceId}`, { method: "GET", token });
}

export async function updateInvoice(invoiceId, invoiceData, token) {
  return request(`/clients/invoices/${invoiceId}`, { method: "PATCH", body: invoiceData, token });
}

export async function deleteInvoice(invoiceId, token) {
  return request(`/clients/invoices/${invoiceId}`, { method: "DELETE", token });
}

// Communication APIs
export async function createCommunication(commData, token) {
  return request("/clients/communications", { method: "POST", body: commData, token });
}

export async function listCommunications(token, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const path = queryString ? `/clients/communications?${queryString}` : "/clients/communications";
  return request(path, { method: "GET", token });
}

export async function deleteCommunication(commId, token) {
  return request(`/clients/communications/${commId}`, { method: "DELETE", token });
}

export async function generateMagicLink(clientId, token) {
  return request(`/clients/${clientId}/generate-magic-link`, { method: "POST", token });
}


