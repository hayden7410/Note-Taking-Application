import tagDAO from "../dao/tagdao.js";
import noteDAO from "../dao/notedao.js";

// Traceability:
// UC-09 User tags a note.
// UC-15 User searches notes by tags.

// Traceability: UC-15 loads the user's available tags.
const getTagsByUser = async (userId) => {
  return await tagDAO.getTagsByUserId(userId);
};

// Traceability: UC-09 loads tags attached to a specific note.
const getTagsByNote = async (noteId, userId) => {
  const existingNote = await noteDAO.getNoteById(noteId, userId);

  if (!existingNote) {
    throw new Error("Note not found.");
  }

  return await tagDAO.getTagsByNoteId(noteId, userId);
};

// Traceability: UC-15 finds notes that match a selected tag.
const getNotesByTag = async (tagId, userId) => {
  const existingTag = await tagDAO.getTagById(tagId, userId);

  if (!existingTag) {
    throw new Error("Tag not found.");
  }

  const notes = await tagDAO.getNotesByTagId(tagId, userId);
  return { tag: existingTag, notes };
};

// Traceability: UC-09 creates a tag if needed and attaches it to a note.
const createTag = async (tagName, userId, noteId = null) => {
  const normalizedTagName = tagName?.trim();

  if (!normalizedTagName) {
    throw new Error("tagName is required.");
  }

  if (noteId !== null) {
    const existingNote = await noteDAO.getNoteById(noteId, userId);

    if (!existingNote) {
      throw new Error("Note not found.");
    }
  }

  let tag = await tagDAO.getTagByName(normalizedTagName, userId);
  let created = false;

  if (!tag) {
    tag = await tagDAO.createTag(normalizedTagName, userId);
    created = true;
  }

  if (noteId !== null) {
    await tagDAO.attachTagToNote(tag.tagId, noteId);
  }

  return { tag, created };
};

// Traceability: UC-09 renames an existing tag.
const updateTag = async (tagId, tagName, userId) => {
  const normalizedTagName = tagName?.trim();

  if (!normalizedTagName) {
    throw new Error("tagName is required.");
  }

  const existingTag = await tagDAO.getTagById(tagId, userId);

  if (!existingTag) {
    throw new Error("Tag not found.");
  }

  const duplicateTag = await tagDAO.getTagByName(normalizedTagName, userId);

  if (duplicateTag && duplicateTag.tagId !== Number(tagId)) {
    throw new Error("A tag with that name already exists.");
  }

  await tagDAO.updateTag(tagId, normalizedTagName, userId);
  return true;
};

// Traceability: UC-09 removes a tag from a note.
const removeTagFromNote = async (tagId, noteId, userId) => {
  const existingNote = await noteDAO.getNoteById(noteId, userId);

  if (!existingNote) {
    throw new Error("Note not found.");
  }

  const existingTag = await tagDAO.getTagById(tagId, userId);

  if (!existingTag) {
    throw new Error("Tag not found.");
  }

  await tagDAO.removeTagFromNote(tagId, noteId);
  return true;
};

export {
  getTagsByUser,
  getTagsByNote,
  getNotesByTag,
  createTag,
  updateTag,
  removeTagFromNote
};
