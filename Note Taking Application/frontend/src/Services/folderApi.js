import { getAuthHeaders } from "./authApi.js";
const API_URL = "http://localhost:8800/api/folders";


// Get all folders for the authenticated user
export const getFoldersByUser = async () => {
  try {
    const res = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch folders");
    }

    return data;
  } catch (error) {
    console.error("Get folders error:", error);
    throw error;
  }
};

// Get a specific folder by ID
export const getFolderById = async (folderId) => {
  try {
    const res = await fetch(`${API_URL}/${folderId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Folder not found");
    }

    return data;
  } catch (error) {
    console.error("Get folder error:", error);
    throw error;
  }
};

// Create a new folder
export const createFolder = async (folderName, parentFolderId = null) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify({
        folderName,
        parentFolderId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to create folder");
    }

    return data;
  } catch (error) {
    console.error("Create folder error:", error);
    throw error;
  }
};

// Rename a folder
export const renameFolder = async (folderId, folderName) => {
  try {
    const res = await fetch(`${API_URL}/${folderId}`, {
      method: "PUT",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ folderName })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to rename folder");
    }

    return data;
  } catch (error) {
    console.error("Rename folder error:", error);
    throw error;
  }
};

// Delete a folder
export const deleteFolder = async (folderId) => {
  try {
    const res = await fetch(`${API_URL}/${folderId}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to delete folder");
    }

    return data;
  } catch (error) {
    console.error("Delete folder error:", error);
    throw error;
  }
};
