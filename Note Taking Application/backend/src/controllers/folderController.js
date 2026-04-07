import * as folderService from "../services/folderService.js";

// Get all folders for one user
const getFoldersByUser = async (req, res) => {
  try {
    const userId = req.user.userid;

    const folders = await folderService.getFoldersByUser(userId);

    return res.status(200).json(folders);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Get one folder by id
const getFolderById = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user.userid;

    const folder = await folderService.getFolderById(folderId, userId);

    if (!folder) {
      return res.status(404).json({
        error: "Folder not found"
      });
    }

    return res.status(200).json(folder);
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
};

// Create a folder
const createFolder = async (req, res) => {
  try {
    const { folderName, parentFolderId = null } = req.body;
    const userId = req.user.userid;

    if (!folderName) {
      return res.status(400).json({
        error: "folderName is required"
      });
    }

    const newFolder = await folderService.createFolder(
      folderName,
      userId,
      parentFolderId
    );

    return res.status(201).json({
      message: "Folder created successfully",
      folder: newFolder
    });
  } catch (error) {
    if (error.message === "A folder with that name already exists.") {
      return res.status(409).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// Rename folder
const renameFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { folderName } = req.body;
    const userId = req.user.userid;

    if (!folderName) {
      return res.status(400).json({
        error: "folderName is required"
      });
    }

    await folderService.renameFolder(folderId, folderName, userId);

    return res.status(200).json({
      message: "Folder renamed successfully"
    });
  } catch (error) {
    if (error.message === "Folder not found.") {
      return res.status(404).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: error.message
    });
  }
};

// Delete folder
const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const userId = req.user.userid;

    await folderService.deleteFolder(folderId, userId);

    return res.status(200).json({
      message: "Folder deleted successfully"
    });
  } catch (error) {
    if (error.message === "Folder not found.") {
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
  getFoldersByUser,
  getFolderById,
  createFolder,
  renameFolder,
  deleteFolder
};