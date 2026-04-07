import db from "../config/db.js";
import Tag from "../models/tag.js";
import Note from "../models/note.js";

// Traceability:
// UC-09 User tags a note.
// UC-15 User searches notes by tags.

const mapRowToTag = (row) => new Tag(row.tagId, row.tagName, row.userId);
const mapRowToNote = (row) => new Note(
  row.noteId,
  row.title,
  row.content,
  row.dateCreated,
  row.modifiedDate,
  row.folderId,
  row.userId
);

// Traceability: UC-15 lists the tags available to the user.
const getTagsByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT tagId, tagName, userId
      FROM tag
      WHERE userId = ?
      ORDER BY tagName ASC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);
      resolve(results.map(mapRowToTag));
    });
  });
};

// Traceability: UC-09 lists tags attached to one note.
const getTagsByNoteId = (noteId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT t.tagId, t.tagName, t.userId
      FROM tag t
      INNER JOIN note_tags nt ON nt.tagId = t.tagId
      INNER JOIN notes n ON n.noteId = nt.noteId
      WHERE nt.noteId = ? AND t.userId = ? AND n.userId = ?
      ORDER BY t.tagName ASC
    `;

    db.query(sql, [noteId, userId, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results.map(mapRowToTag));
    });
  });
};

// Traceability: UC-15 finds notes associated with a tag.
const getNotesByTagId = (tagId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DISTINCT n.noteId, n.title, n.content, n.dateCreated, n.modifiedDate, n.folderId, n.userId
      FROM notes n
      INNER JOIN note_tags nt ON nt.noteId = n.noteId
      INNER JOIN tag t ON t.tagId = nt.tagId
      WHERE t.tagId = ? AND t.userId = ? AND n.userId = ?
      ORDER BY n.modifiedDate DESC, n.dateCreated DESC
    `;

    db.query(sql, [tagId, userId, userId], (err, results) => {
      if (err) return reject(err);
      resolve(results.map(mapRowToNote));
    });
  });
};

const getTagById = (tagId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT tagId, tagName, userId
      FROM tag
      WHERE tagId = ? AND userId = ?
    `;

    db.query(sql, [tagId, userId], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      resolve(mapRowToTag(results[0]));
    });
  });
};

// Traceability: UC-09 checks whether the tag already exists.
const getTagByName = (tagName, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT tagId, tagName, userId
      FROM tag
      WHERE LOWER(tagName) = LOWER(?) AND userId = ?
      LIMIT 1
    `;

    db.query(sql, [tagName, userId], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      resolve(mapRowToTag(results[0]));
    });
  });
};

// Traceability: UC-09 creates a new tag.
const createTag = (tagName, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO tag (tagName, userId)
      VALUES (?, ?)
    `;

    db.query(sql, [tagName, userId], (err, result) => {
      if (err) return reject(err);
      resolve(new Tag(result.insertId, tagName, userId));
    });
  });
};

// Traceability: UC-09 renames an existing tag.
const updateTag = (tagId, tagName, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tag
      SET tagName = ?
      WHERE tagId = ? AND userId = ?
    `;

    db.query(sql, [tagName, tagId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Traceability: UC-09 links a tag to a note.
const attachTagToNote = (tagId, noteId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT IGNORE INTO note_tags (noteId, tagId)
      VALUES (?, ?)
    `;

    db.query(sql, [noteId, tagId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Traceability: UC-09 removes the tag-note link.
const removeTagFromNote = (tagId, noteId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM note_tags
      WHERE noteId = ? AND tagId = ?
    `;

    db.query(sql, [noteId, tagId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export default {
  getTagsByUserId,
  getTagsByNoteId,
  getNotesByTagId,
  getTagById,
  getTagByName,
  createTag,
  updateTag,
  attachTagToNote,
  removeTagFromNote
};
