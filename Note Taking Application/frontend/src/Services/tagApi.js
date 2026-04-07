import { getAuthHeaders } from "./authApi.js";

const API_URL = "http://localhost:8800/api/tags";

export const getTagsByUser = async () => {
  const res = await fetch(API_URL, {
    headers: getAuthHeaders()
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch tags");
  }

  return data;
};

export const getTagsByNote = async (noteId) => {
  const res = await fetch(`${API_URL}/note/${noteId}`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch note tags");
  }

  return data;
};

export const getNotesByTag = async (tagId) => {
  const res = await fetch(`${API_URL}/${tagId}/notes`, {
    headers: getAuthHeaders()
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch notes for tag");
  }

  return data;
};

export const createTag = async (tagName, noteId = null) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ tagName, noteId })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to create tag");
  }

  return data;
};

export const updateTag = async (tagId, tagName) => {
  const res = await fetch(`${API_URL}/${tagId}`, {
    method: "PUT",
    headers: getAuthHeaders(true),
    body: JSON.stringify({ tagName })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to update tag");
  }

  return data;
};

export const removeTagFromNote = async (tagId, noteId) => {
  const res = await fetch(`${API_URL}/${tagId}/notes/${noteId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to remove tag from note");
  }

  return data;
};
