import * as tagService from "../services/tagService.js";

const getTagsByUser = async (req, res) => {
  try {
    const userId = req.user.userid;
    const tags = await tagService.getTagsByUser(userId);
    return res.status(200).json(tags);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getTagsByNote = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { noteId } = req.params;
    const tags = await tagService.getTagsByNote(noteId, userId);
    return res.status(200).json(tags);
  } catch (error) {
    if (error.message === "Note not found.") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

const getNotesByTag = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { tagId } = req.params;
    const result = await tagService.getNotesByTag(tagId, userId);
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "Tag not found.") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

const createTag = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { tagName, noteId = null } = req.body;

    const result = await tagService.createTag(tagName, userId, noteId);

    return res.status(result.created ? 201 : 200).json({
      message: result.created ? "Tag created successfully" : "Existing tag attached successfully",
      tag: result.tag
    });
  } catch (error) {
    if (error.message === "Note not found.") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "tagName is required.") {
      return res.status(400).json({ error: "tagName is required" });
    }

    return res.status(500).json({ error: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { tagId } = req.params;
    const { tagName } = req.body;

    await tagService.updateTag(tagId, tagName, userId);

    return res.status(200).json({ message: "Tag updated successfully" });
  } catch (error) {
    if (error.message === "tagName is required.") {
      return res.status(400).json({ error: "tagName is required" });
    }

    if (error.message === "Tag not found.") {
      return res.status(404).json({ error: error.message });
    }

    if (error.message === "A tag with that name already exists.") {
      return res.status(409).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

const removeTagFromNote = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { tagId, noteId } = req.params;

    await tagService.removeTagFromNote(tagId, noteId, userId);

    return res.status(200).json({ message: "Tag removed from note successfully" });
  } catch (error) {
    if (error.message === "Note not found." || error.message === "Tag not found.") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

export default {
  getTagsByUser,
  getTagsByNote,
  getNotesByTag,
  createTag,
  updateTag,
  removeTagFromNote
};
