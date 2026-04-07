import { getAuthHeaders } from "./authApi.js";

const API_URL = "http://localhost:8800/api/graphs";

export const getSavedGraphs = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch saved graphs");
  }

  return data;
};

export const getGraphById = async (graphId) => {
  const res = await fetch(`${API_URL}/${graphId}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch graph details");
  }

  return data;
};

export const generateMergePreview = async (tagIds) => {
  const res = await fetch(`${API_URL}/preview`, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ tagIds }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate merge graph");
  }

  return data;
};

export const saveGraph = async ({ graphName, tagIds, nodes, edges }) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ graphName, tagIds, nodes, edges }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to save graph");
  }

  return data;
};

export const updateGraph = async (graphId, { graphName, tagIds, nodes, edges }) => {
  const res = await fetch(`${API_URL}/${graphId}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ graphName, tagIds, nodes, edges }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update graph");
  }

  return data;
};
