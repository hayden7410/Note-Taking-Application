import db from "../config/db.js";
import Graph from "../models/graph.js";
import Note from "../models/note.js";

// Traceability:
// UC-12 User merges notes into a visual representation using tags.
// UC-24 User organizes the visual display of notes.

const toGraph = (row) => new Graph(
  row.graphId,
  row.graphName ?? row.graphname,
  row.userId,
  row.dateCreated,
  row.updatedAt ?? null
);

const toNote = (row) => new Note(
  row.noteId,
  row.title,
  row.content,
  row.dateCreated,
  row.modifiedDate,
  row.folderId,
  row.userId
);

// Traceability: UC-12 resolves which selected tags belong to the user.
const getTagsByIds = async (tagIds, userId) => {
  if (!tagIds.length) {
    return [];
  }

  const placeholders = tagIds.map(() => "?").join(", ");
  const sql = `
    SELECT tagId, tagName, userId
    FROM tag
    WHERE userId = ? AND tagId IN (${placeholders})
    ORDER BY tagName ASC
  `;

  const [rows] = await db.promise().query(sql, [userId, ...tagIds]);
  return rows;
};

// Traceability: UC-12 loads notes and matching tags for graph generation.
const getNoteRowsByTagIds = async (tagIds, userId) => {
  if (!tagIds.length) {
    return [];
  }

  const placeholders = tagIds.map(() => "?").join(", ");
  const sql = `
    SELECT
      n.noteId,
      n.title,
      n.content,
      n.dateCreated,
      n.modifiedDate,
      n.folderId,
      n.userId,
      t.tagId,
      t.tagName
    FROM notes n
    INNER JOIN note_tags nt ON nt.noteId = n.noteId
    INNER JOIN tag t ON t.tagId = nt.tagId
    WHERE n.userId = ?
      AND t.userId = ?
      AND t.tagId IN (${placeholders})
    ORDER BY n.dateCreated ASC, n.noteId ASC, t.tagName ASC
  `;

  const [rows] = await db.promise().query(sql, [userId, userId, ...tagIds]);
  return rows;
};

// Traceability: UC-24 validates graph nodes against the user's notes.
const getNotesByIds = async (noteIds, userId) => {
  if (!noteIds.length) {
    return [];
  }

  const placeholders = noteIds.map(() => "?").join(", ");
  const sql = `
    SELECT noteId, title, content, dateCreated, modifiedDate, folderId, userId
    FROM notes
    WHERE userId = ? AND noteId IN (${placeholders})
    ORDER BY dateCreated ASC, noteId ASC
  `;

  const [rows] = await db.promise().query(sql, [userId, ...noteIds]);
  return rows.map(toNote);
};

// Traceability: UC-24 lists saved graph layouts for the user.
const getGraphsByUserId = async (userId) => {
  const sql = `
    SELECT graphId, graphname AS graphName, userId, dateCreated, updatedAt
    FROM graph
    WHERE userId = ?
    ORDER BY dateCreated DESC, graphId DESC
  `;

  const [rows] = await db.promise().query(sql, [userId]);
  return rows.map(toGraph);
};

const getGraphById = async (graphId, userId) => {
  const sql = `
    SELECT graphId, graphname AS graphName, userId, dateCreated, updatedAt
    FROM graph
    WHERE graphId = ? AND userId = ?
  `;

  const [rows] = await db.promise().query(sql, [graphId, userId]);

  if (!rows.length) {
    return null;
  }

  return toGraph(rows[0]);
};

// Traceability: UC-24 loads a saved graph with nodes, edges, and tags.
const getGraphDetailsById = async (graphId, userId) => {
  const graph = await getGraphById(graphId, userId);

  if (!graph) {
    return null;
  }

  const connection = db.promise();

  const [tagRows] = await connection.query(
    `
      SELECT t.tagId, t.tagName, t.userId
      FROM graph_tags gt
      INNER JOIN tag t ON t.tagId = gt.tagId
      WHERE gt.graphId = ?
      ORDER BY t.tagName ASC
    `,
    [graphId]
  );

  const [nodeRows] = await connection.query(
    `
      SELECT
        gn.graphNodeId,
        gn.noteId,
        gn.posX,
        gn.posY,
        gn.width,
        gn.height,
        gn.displayOrder,
        n.title,
        n.content,
        n.dateCreated,
        n.modifiedDate,
        n.folderId,
        n.userId
      FROM graph_nodes gn
      INNER JOIN notes n ON n.noteId = gn.noteId
      WHERE gn.graphId = ?
      ORDER BY gn.displayOrder ASC, n.dateCreated ASC, n.noteId ASC
    `,
    [graphId]
  );

  const noteIds = nodeRows.map((row) => row.noteId);
  let noteTagRows = [];

  if (noteIds.length > 0) {
    const notePlaceholders = noteIds.map(() => "?").join(", ");
    const selectedTagIds = tagRows.map((tag) => tag.tagId);
    const tagFilter = selectedTagIds.length
      ? ` AND t.tagId IN (${selectedTagIds.map(() => "?").join(", ")})`
      : "";

    const params = [userId, ...noteIds, ...selectedTagIds];

    const [rows] = await connection.query(
      `
        SELECT nt.noteId, t.tagId, t.tagName
        FROM note_tags nt
        INNER JOIN tag t ON t.tagId = nt.tagId
        WHERE t.userId = ?
          AND nt.noteId IN (${notePlaceholders})
          ${tagFilter}
        ORDER BY t.tagName ASC
      `,
      params
    );

    noteTagRows = rows;
  }

  const tagsByNoteId = new Map();
  noteTagRows.forEach((row) => {
    const currentTags = tagsByNoteId.get(row.noteId) || [];
    currentTags.push({ tagId: row.tagId, tagName: row.tagName });
    tagsByNoteId.set(row.noteId, currentTags);
  });

  const nodes = nodeRows.map((row) => ({
    graphNodeId: row.graphNodeId,
    noteId: row.noteId,
    title: row.title,
    content: row.content,
    dateCreated: row.dateCreated,
    modifiedDate: row.modifiedDate,
    folderId: row.folderId,
    userId: row.userId,
    x: Number(row.posX ?? 0),
    y: Number(row.posY ?? 0),
    width: Number(row.width ?? 220),
    height: Number(row.height ?? 120),
    displayOrder: Number(row.displayOrder ?? 0),
    matchingTags: tagsByNoteId.get(row.noteId) || [],
  }));

  const [edgeRows] = await connection.query(
    `
      SELECT
        ge.graphEdgeId,
        ge.sharedTagId,
        ge.relationType,
        sourceNode.noteId AS sourceNoteId,
        targetNode.noteId AS targetNoteId,
        t.tagName AS sharedTagName
      FROM graph_edges ge
      INNER JOIN graph_nodes sourceNode ON sourceNode.graphNodeId = ge.sourceNodeId
      INNER JOIN graph_nodes targetNode ON targetNode.graphNodeId = ge.targetNodeId
      LEFT JOIN tag t ON t.tagId = ge.sharedTagId
      WHERE ge.graphId = ?
      ORDER BY ge.graphEdgeId ASC
    `,
    [graphId]
  );

  const edges = edgeRows.map((row) => ({
    graphEdgeId: row.graphEdgeId,
    sourceNoteId: row.sourceNoteId,
    targetNoteId: row.targetNoteId,
    sharedTagId: row.sharedTagId,
    sharedTagIds: row.sharedTagId ? [row.sharedTagId] : [],
    sharedTagNames: row.sharedTagName ? [row.sharedTagName] : [],
    relationType: row.relationType || "shared_tag",
  }));

  return {
    graph,
    tags: tagRows,
    nodes,
    edges,
  };
};

// Traceability: UC-12 and UC-24 persist the graph structure, node layout, and edges.
const persistGraphStructure = async (connection, graphId, tagIds, nodes, edges) => {
  await connection.query(`DELETE FROM graph_edges WHERE graphId = ?`, [graphId]);
  await connection.query(`DELETE FROM graph_nodes WHERE graphId = ?`, [graphId]);
  await connection.query(`DELETE FROM graph_tags WHERE graphId = ?`, [graphId]);

  if (tagIds.length > 0) {
    const graphTagValues = tagIds.map((tagId) => [graphId, tagId]);
    await connection.query(`INSERT INTO graph_tags (graphId, tagId) VALUES ?`, [graphTagValues]);
  }

  const nodeIdMap = new Map();

  for (const node of nodes) {
    const [nodeResult] = await connection.query(
      `
        INSERT INTO graph_nodes (graphId, noteId, posX, posY, width, height, displayOrder)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        graphId,
        node.noteId,
        node.x ?? node.posX ?? 0,
        node.y ?? node.posY ?? 0,
        node.width ?? 220,
        node.height ?? 120,
        node.displayOrder ?? 0,
      ]
    );

    nodeIdMap.set(Number(node.noteId), nodeResult.insertId);
  }

  for (const edge of edges) {
    const sourceNodeId = nodeIdMap.get(Number(edge.sourceNoteId));
    const targetNodeId = nodeIdMap.get(Number(edge.targetNoteId));

    if (!sourceNodeId || !targetNodeId || sourceNodeId === targetNodeId) {
      continue;
    }

    await connection.query(
      `
        INSERT IGNORE INTO graph_edges (graphId, sourceNodeId, targetNodeId, sharedTagId, relationType)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        graphId,
        sourceNodeId,
        targetNodeId,
        edge.sharedTagId ?? edge.sharedTagIds?.[0] ?? null,
        edge.relationType ?? "shared_tag",
      ]
    );
  }
};

// Traceability: UC-12 and UC-24 create a saved graph record.
const saveGraph = async (graphName, userId, tagIds, nodes, edges) => {
  const connection = db.promise();

  await connection.beginTransaction();

  try {
    const [graphResult] = await connection.query(
      `
        INSERT INTO graph (graphname, userId, dateCreated, updatedAt)
        VALUES (?, ?, NOW(), NOW())
      `,
      [graphName, userId]
    );

    const graphId = graphResult.insertId;
    await persistGraphStructure(connection, graphId, tagIds, nodes, edges);
    await connection.commit();

    return await getGraphById(graphId, userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

// Traceability: UC-24 updates an existing saved graph.
const updateGraph = async (graphId, graphName, userId, tagIds, nodes, edges) => {
  const connection = db.promise();

  await connection.beginTransaction();

  try {
    const [existingRows] = await connection.query(
      `
        SELECT graphId
        FROM graph
        WHERE graphId = ? AND userId = ?
      `,
      [graphId, userId]
    );

    if (!existingRows.length) {
      throw new Error("Graph not found.");
    }

    await connection.query(
      `
        UPDATE graph
        SET graphname = ?, updatedAt = NOW()
        WHERE graphId = ? AND userId = ?
      `,
      [graphName, graphId, userId]
    );

    await persistGraphStructure(connection, graphId, tagIds, nodes, edges);
    await connection.commit();

    return await getGraphById(graphId, userId);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

export default {
  getTagsByIds,
  getNoteRowsByTagIds,
  getNotesByIds,
  getGraphsByUserId,
  getGraphById,
  getGraphDetailsById,
  saveGraph,
  updateGraph,
};
