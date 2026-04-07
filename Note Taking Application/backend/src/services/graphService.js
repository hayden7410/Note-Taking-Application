import graphDAO from "../dao/graphdao.js";
import { buildMergeResearch } from "./graphResearchService.js";

// Traceability:
// UC-12 User merges notes into a visual representation using tags.
// UC-24 User organizes the visual display of notes.

const normalizeIds = (values = []) => {
  return [...new Set(
    values
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  )];
};

const buildDefaultGraphName = (tags = []) => {
  if (!tags.length) {
    return `Merged Graph ${new Date().toLocaleDateString()}`;
  }

  const base = tags.slice(0, 2).map((tag) => tag.tagName).join(" + ");
  return tags.length > 2 ? `${base} + more` : `${base} Merge`;
};

// Traceability: UC-12 assembles the merged note graph preview from selected tags.
const generatePreview = async (tagIds, userId) => {
  const normalizedTagIds = normalizeIds(tagIds);

  if (!normalizedTagIds.length) {
    throw new Error("Please select at least one tag.");
  }

  const selectedTags = await graphDAO.getTagsByIds(normalizedTagIds, userId);

  if (!selectedTags.length) {
    throw new Error("No valid tags were found for this user.");
  }

  const noteRows = await graphDAO.getNoteRowsByTagIds(normalizedTagIds, userId);
  const noteMap = new Map();

  noteRows.forEach((row) => {
    if (!noteMap.has(row.noteId)) {
      noteMap.set(row.noteId, {
        noteId: row.noteId,
        title: row.title,
        content: row.content,
        dateCreated: row.dateCreated,
        modifiedDate: row.modifiedDate,
        folderId: row.folderId,
        userId: row.userId,
        matchingTags: [],
      });
    }

    const currentNote = noteMap.get(row.noteId);
    const tagAlreadyAdded = currentNote.matchingTags.some((tag) => Number(tag.tagId) === Number(row.tagId));

    if (!tagAlreadyAdded) {
      currentNote.matchingTags.push({
        tagId: row.tagId,
        tagName: row.tagName,
      });
    }
  });

  const notes = Array.from(noteMap.values());
  const { nodes, edges, research } = buildMergeResearch(notes, selectedTags);

  return {
    graphName: buildDefaultGraphName(selectedTags),
    tags: selectedTags,
    nodes,
    edges,
    research,
  };
};

const getGraphsByUser = async (userId) => {
  return await graphDAO.getGraphsByUserId(userId);
};

// Traceability: UC-24 loads a saved graph layout for further organization.
const getGraphById = async (graphId, userId) => {
  const details = await graphDAO.getGraphDetailsById(graphId, userId);

  if (!details) {
    throw new Error("Graph not found.");
  }

  return {
    ...details,
    research: {
      noteCount: details.nodes.length,
      connectionCount: details.edges.length,
    },
  };
};

const sanitizeGraphPayload = async ({ graphName, tagIds, nodes, edges }, userId) => {
  const normalizedTagIds = normalizeIds(tagIds);

  if (!normalizedTagIds.length) {
    throw new Error("At least one tag is required to save a graph.");
  }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    throw new Error("There are no merged notes to save.");
  }

  const selectedTags = await graphDAO.getTagsByIds(normalizedTagIds, userId);

  if (!selectedTags.length) {
    throw new Error("No valid tags were found for this user.");
  }

  const normalizedNoteIds = normalizeIds(nodes.map((node) => node.noteId));
  const validNotes = await graphDAO.getNotesByIds(normalizedNoteIds, userId);
  const validNoteIdSet = new Set(validNotes.map((note) => Number(note.noteId)));

  const sanitizedNodes = nodes
    .filter((node) => validNoteIdSet.has(Number(node.noteId)))
    .map((node, index) => ({
      noteId: Number(node.noteId),
      x: Number(node.x ?? node.posX ?? 0),
      y: Number(node.y ?? node.posY ?? 0),
      width: Number(node.width ?? 220),
      height: Number(node.height ?? 120),
      displayOrder: Number(node.displayOrder ?? index),
    }));

  if (!sanitizedNodes.length) {
    throw new Error("No valid notes were available to save.");
  }

  const allowedNoteIds = new Set(sanitizedNodes.map((node) => Number(node.noteId)));
  const sanitizedEdges = (Array.isArray(edges) ? edges : [])
    .filter((edge) => allowedNoteIds.has(Number(edge.sourceNoteId)) && allowedNoteIds.has(Number(edge.targetNoteId)))
    .map((edge) => ({
      sourceNoteId: Number(edge.sourceNoteId),
      targetNoteId: Number(edge.targetNoteId),
      sharedTagId: edge.sharedTagId ?? edge.sharedTagIds?.[0] ?? null,
      sharedTagIds: Array.isArray(edge.sharedTagIds) ? edge.sharedTagIds : [],
      relationType: edge.relationType || "shared_tag",
    }));

  const finalGraphName = graphName?.trim() || buildDefaultGraphName(selectedTags);

  return {
    finalGraphName,
    normalizedTagIds,
    sanitizedNodes,
    sanitizedEdges,
  };
};

// Traceability: UC-12 and UC-24 save a generated graph and its layout.
const saveGraph = async (payload, userId) => {
  const {
    finalGraphName,
    normalizedTagIds,
    sanitizedNodes,
    sanitizedEdges,
  } = await sanitizeGraphPayload(payload, userId);

  return await graphDAO.saveGraph(finalGraphName, userId, normalizedTagIds, sanitizedNodes, sanitizedEdges);
};

// Traceability: UC-24 updates the layout of an existing graph.
const updateGraph = async (graphId, payload, userId) => {
  const {
    finalGraphName,
    normalizedTagIds,
    sanitizedNodes,
    sanitizedEdges,
  } = await sanitizeGraphPayload(payload, userId);

  return await graphDAO.updateGraph(graphId, finalGraphName, userId, normalizedTagIds, sanitizedNodes, sanitizedEdges);
};

export {
  generatePreview,
  getGraphsByUser,
  getGraphById,
  saveGraph,
  updateGraph,
};
