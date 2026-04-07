import noteDAO from "../dao/notedao.js";
import folderDAO from "../dao/folderdao.js";

// Traceability:
// UC-05 User creates a note.
// UC-07 User saves a note.
// UC-08 User modifies a note.
// UC-10 User deletes a note.
// UC-11 User reads a note.
// UC-13 User relocates notes into another folder.
// UC-17 User renames the title of the note.

// Traceability: UC-11 returns all notes available to the user.
// Get all notes for a specific user
const getNotesByUser = async (userId) => {
  return await noteDAO.getNotesByUserId(userId);
};

// Traceability: UC-11 returns notes that are not assigned to a folder.
// Get notes that are not inside any folder
const getUnfolderedNotesByUser = async (userId) => {
  return await noteDAO.getUnfolderedNotesByUserId(userId);
};

// Traceability: UC-11 returns notes inside a selected folder.
// Get notes inside one folder
const getNotesByFolder = async (folderId, userId) => {
  return await noteDAO.getNotesByFolderId(folderId, userId);
};

// Traceability: UC-11 loads a single note for reading or editing.
// Get one note by noteId
const getNoteById = async (noteId, userId) => {
  return await noteDAO.getNoteById(noteId, userId);
};

// Traceability: UC-05 creates a note and optionally places it in a folder.
// Create a note
const createNote = async (title, content, userId, folderId = null) => {
  if (folderId !== null) {
    const folder = await folderDAO.getFolderById(folderId, userId);

    if (!folder) {
      throw new Error("Folder not found.");
    }
  }

  return await noteDAO.createNote(title, content, userId, folderId);
};

// Traceability: UC-07, UC-08, and UC-17 persist note content and title changes.
// Update note
const updateNote = async (noteId, title, content, userId) => {
  const existingNote = await noteDAO.getNoteById(noteId, userId);

  if (!existingNote) {
    throw new Error("Note not found.");
  }

  await noteDAO.updateNote(noteId, title, content, userId);
  return true;
};

// Traceability: UC-10 removes an existing note.
// Delete note
const deleteNote = async (noteId, userId) => {
  const existingNote = await noteDAO.getNoteById(noteId, userId);

  if (!existingNote) {
    throw new Error("Note not found.");
  }

  await noteDAO.deleteNote(noteId, userId);
  return true;
};

// Traceability: UC-13 moves a note between folders or back to unfoldered.
// Move note into a folder or remove it from folder
const moveNoteToFolder = async (noteId, folderId = null, userId) => {
  const existingNote = await noteDAO.getNoteById(noteId, userId);

  if (!existingNote) {
    throw new Error("Note not found.");
  }

  if (folderId !== null) {
    const folder = await folderDAO.getFolderById(folderId, userId);

    if (!folder) {
      throw new Error("Folder not found.");
    }
  }

  await noteDAO.moveNoteToFolder(noteId, folderId, userId);
  return true;
};

export {
  getNotesByUser,
  getUnfolderedNotesByUser,
  getNotesByFolder,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  moveNoteToFolder
};