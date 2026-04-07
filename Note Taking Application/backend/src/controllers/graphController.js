import * as graphService from "../services/graphService.js";

const getGraphsByUser = async (req, res) => {
  try {
    const userId = req.user.userid;
    const graphs = await graphService.getGraphsByUser(userId);
    return res.status(200).json(graphs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getGraphById = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { graphId } = req.params;
    const graph = await graphService.getGraphById(graphId, userId);
    return res.status(200).json(graph);
  } catch (error) {
    if (error.message === "Graph not found.") {
      return res.status(404).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

const generatePreview = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { tagIds = [] } = req.body;
    const preview = await graphService.generatePreview(tagIds, userId);
    return res.status(200).json(preview);
  } catch (error) {
    if (
      error.message === "Please select at least one tag." ||
      error.message === "No valid tags were found for this user."
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

const saveGraph = async (req, res) => {
  try {
    const userId = req.user.userid;
    const graph = await graphService.saveGraph(req.body, userId);

    return res.status(201).json({
      message: "Graph saved successfully",
      graph,
    });
  } catch (error) {
    if (
      error.message === "At least one tag is required to save a graph." ||
      error.message === "There are no merged notes to save." ||
      error.message === "No valid tags were found for this user." ||
      error.message === "No valid notes were available to save."
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

const updateGraph = async (req, res) => {
  try {
    const userId = req.user.userid;
    const { graphId } = req.params;
    const graph = await graphService.updateGraph(graphId, req.body, userId);

    return res.status(200).json({
      message: "Graph updated successfully",
      graph,
    });
  } catch (error) {
    if (error.message === "Graph not found.") {
      return res.status(404).json({ error: error.message });
    }

    if (
      error.message === "At least one tag is required to save a graph." ||
      error.message === "There are no merged notes to save." ||
      error.message === "No valid tags were found for this user." ||
      error.message === "No valid notes were available to save."
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: error.message });
  }
};

export default {
  getGraphsByUser,
  getGraphById,
  generatePreview,
  saveGraph,
  updateGraph,
};
