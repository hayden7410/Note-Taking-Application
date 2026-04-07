import db from "../config/db.js";
import Folder from "../models/folder.js";  

// Traceability:
// UC-18 User creates a folder.
// UC-19 User deletes a folder.
// UC-20 User renames the title of the folder.

// Get all folders for a specific user
const getFoldersByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT folderId, folderName, userId, parentFolderId
      FROM folder
      WHERE userId = ?
      ORDER BY folderName ASC
    `;

    db.query(sql, [userId], (err, results) => {
      if (err) return reject(err);

      const folders = results.map(
        (row) =>
          new Folder(
            row.folderId,
            row.folderName,
            row.userId,
            row.parentFolderId
          )
      );

      resolve(folders);
    });
  });
};

// Get one folder by folderId
const getFolderById = (folderId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT folderId, folderName, userId, parentFolderId
      FROM folder
      WHERE folderId = ? AND userId = ?
    `;

    db.query(sql, [folderId, userId], (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      const row = results[0];
      const folder = new Folder(
        row.folderId,
        row.folderName,
        row.userId,
        row.parentFolderId
      );

      resolve(folder);
    });
  });
};

// Traceability: UC-18 and UC-20 check for duplicate folder names in the same scope.
// Check whether a folder with the same name already exists under the same parent
const findFolderByNameAndParent = (folderName, userId, parentFolderId = null) => {
  return new Promise((resolve, reject) => {
    let sql;
    let params;

    if (parentFolderId === null) {
      sql = `
        SELECT folderId, folderName, userId, parentFolderId
        FROM folder
        WHERE folderName = ? AND userId = ? AND parentFolderId IS NULL
      `;
      params = [folderName, userId];
    } else {
      sql = `
        SELECT folderId, folderName, userId, parentFolderId
        FROM folder
        WHERE folderName = ? AND userId = ? AND parentFolderId = ?
      `;
      params = [folderName, userId, parentFolderId];
    }

    db.query(sql, params, (err, results) => {
      if (err) return reject(err);

      if (results.length === 0) {
        return resolve(null);
      }

      const row = results[0];
      const folder = new Folder(
        row.folderId,
        row.folderName,
        row.userId,
        row.parentFolderId
      );

      resolve(folder);
    });
  });
};

// Traceability: UC-18 inserts a new folder record.
// Create a new folder
const createFolder = (folderName, userId, parentFolderId = null) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO folder (folderName, userId, parentFolderId)
      VALUES (?, ?, ?)
    `;

    db.query(sql, [folderName, userId, parentFolderId], (err, result) => {
      if (err) return reject(err);

      const newFolder = new Folder(
        result.insertId,
        folderName,
        userId,
        parentFolderId
      );

      resolve(newFolder);
    });
  });
};

// Traceability: UC-20 updates the folder title.
// Rename folder
const renameFolder = (folderId, folderName, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE folder
      SET folderName = ?
      WHERE folderId = ? AND userId = ?
    `;

    db.query(sql, [folderName, folderId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Traceability: UC-19 deletes the folder record.
// Delete folder by folderId
const deleteFolder = (folderId, userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM folder
      WHERE folderId = ? AND userId = ?
    `;

    db.query(sql, [folderId, userId], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

export default {
  getFoldersByUserId,
  getFolderById,
  findFolderByNameAndParent,
  createFolder,
  renameFolder,
  deleteFolder
};