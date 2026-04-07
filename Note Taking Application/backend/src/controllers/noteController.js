import * as noteService from "../services/noteService.js";

// Get all notes for one user
const getNotesByUser = async (req, res) => {
  try {
    const userId = req.user.userid;

    const notes = await noteService.getNotesByUser(userId);

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get notes without folder
const getUnfolderedNotesByUser = async (req, res) => {
  try {
    const userId = req.user.userid;

    const notes = await noteService.getUnfolderedNotesByUser(userId);

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get notes inside a folder
const getNotesByFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user.userid;

    const notes = await noteService.getNotesByFolder(folderId, userId);

    return res.status(200).json(notes);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get one note by id
const getNoteById = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.userid;

    const note = await noteService.getNoteById(noteId, userId);

    if (!note) {
      return res.status(404).json({
        error: "Note not found"
      });
    }

    return res.status(200).json(note);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Create note
const createNote = async (req, res) => {
  try {
    const { title, content, folderId = null } = req.body;
    const userId = req.user.userid;

    if (!title) {
      return res.status(400).json({
        error: "title is required"
      });
    }

    const newNote = await noteService.createNote(
      title,
      content || "",
      userId,
      folderId
    );

    return res.status(201).json({
      message: "Note created successfully",
      note: newNote
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Update note
const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userid;

    if (!title) {
      return res.status(400).json({
        error: "title is required"
      });
    }

    await noteService.updateNote(noteId, title, content || "", userId);

    return res.status(200).json({
      message: "Note updated successfully"
    });
  } catch (error) {
    if (error.message === "Note not found.") {
      return res.status(404).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete note
const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.userid;

    await noteService.deleteNote(noteId, userId);

    return res.status(200).json({
      message: "Note deleted successfully"
    });
  } catch (error) {
    if (error.message === "Note not found.") {
      return res.status(404).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// Move note to folder or remove from folder
const moveNoteToFolder = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { folderId = null } = req.body;
    const userId = req.user.userid;

    await noteService.moveNoteToFolder(noteId, folderId, userId);

    return res.status(200).json({
      message: "Note moved successfully"
    });
  } catch (error) {
    if (error.message === "Note not found.") {
      return res.status(404).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

export default {
  getNotesByUser,
  getUnfolderedNotesByUser,
  getNotesByFolder,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  moveNoteToFolder
};