import { getAuthHeaders } from "./authApi.js";
const API_URL = "http://localhost:8800/api/notes";


// Get all notes for the authenticated user
export const getNotesByUser = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch notes");
    }

    return data;
  } catch (error) {
    console.error("Get notes error:", error);
    throw error;
  }
};

// Get unfoldered notes for the authenticated user
export const getUnfolderedNotes = async () => {
  try {
    const res = await fetch(`${API_URL}/unfoldered`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch unfoldered notes");
    }

    return data;
  } catch (error) {
    console.error("Get unfoldered notes error:", error);
    throw error;
  }
};

// Get notes in a specific folder
export const getNotesByFolder = async (folderId) => {
  try {
    const res = await fetch(`${API_URL}/folder/${folderId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch folder notes");
    }

    return data;
  } catch (error) {
    console.error("Get folder notes error:", error);
    throw error;
  }
};

// Get a specific note by ID
export const getNoteById = async (noteId) => {
  try {
    const res = await fetch(`${API_URL}/${noteId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Note not found");
    }

    return data;
  } catch (error) {
    console.error("Get note error:", error);
    throw error;
  }
};

// Create a new note
export const createNote = async (title, content, folderId = null) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        title,
        content,
        folderId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create note");
    }

    return data;
  } catch (error) {
    console.error("Create note error:", error);
    throw error;
  }
};

// Update a note
export const updateNote = async (noteId, title, content) => {
  try {
    const res = await fetch(`${API_URL}/${noteId}`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ title, content })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to update note");
    }

    return data;
  } catch (error) {
    console.error("Update note error:", error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (noteId) => {
  try {
    const res = await fetch(`${API_URL}/${noteId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete note");
    }

    return data;
  } catch (error) {
    console.error("Delete note error:", error);
    throw error;
  }
};

// Move a note to another folder or make it unfoldered
export const moveNoteToFolder = async (noteId, folderId = null) => {
  try {
    const res = await fetch(`${API_URL}/${noteId}/move`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ folderId })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to move note");
    }

    return data;
  } catch (error) {
    console.error("Move note error:", error);
    throw error;
  }
};
