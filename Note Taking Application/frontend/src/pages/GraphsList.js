import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../Services/authApi.js";
import { getGraphById, getSavedGraphs, updateGraph } from "../Services/graphApi.js";
import "./Folders.css";
import "./MergeNotes.css";

// Traceability:
// UC-24 User reorganizes previously saved visual note layouts.

export default function GraphsList() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [graphs, setGraphs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedGraph, setSelectedGraph] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphName, setGraphName] = useState("");
  const [dragging, setDragging] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const showStatus = useCallback((text, error = false) => {
    setStatusMsg({ text, error });
    window.clearTimeout(window.__savedGraphsToastTimer);
    window.__savedGraphsToastTimer = window.setTimeout(() => setStatusMsg(null), 3000);
  }, []);

  const loadGraphs = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const data = await getSavedGraphs();
      setGraphs(data || []);
    } catch (error) {
      console.error("Error loading saved graphs:", error);
      if (error.message === "Authentication required" || error.message === "Invalid or expired token") {
        logout();
        navigate("/login");
        return;
      }
      setErrorMsg(error.message || "Failed to load saved graphs.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getCurrentUser()) {
      logout();
      navigate("/login");
      return;
    }

    loadGraphs();
  }, [loadGraphs, navigate]);

  useEffect(() => {
    if (!dragging) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      const rect = canvasRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      const nextX = Math.max(20, event.clientX - rect.left - dragging.offsetX);
      const nextY = Math.max(20, event.clientY - rect.top - dragging.offsetY);

      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          Number(node.noteId) === Number(dragging.noteId)
            ? { ...node, x: nextX, y: nextY }
            : node
        )
      );
    };

    const handleMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const nodeMap = useMemo(() => {
    return nodes.reduce((acc, node) => {
      acc[node.noteId] = node;
      return acc;
    }, {});
  }, [nodes]);

  const canvasSize = useMemo(() => {
    const width = Math.max(1100, ...nodes.map((node) => (node.x || 0) + (node.width || 220) + 100));
    const height = Math.max(560, ...nodes.map((node) => (node.y || 0) + (node.height || 120) + 100));

    return { width, height };
  }, [nodes]);

  // Traceability: UC-24 opens a saved graph for additional layout changes.
  const openGraph = async (graph) => {
    setLoadingGraph(true);

    try {
      const data = await getGraphById(graph.graphId);
      setSelectedGraph(data.graph);
      setSelectedTags(data.tags || []);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setGraphName(data.graph?.graphName || graph.graphName || graph.graphname || "Saved Graph");
    } catch (error) {
      console.error("Error opening graph:", error);
      showStatus(error.message || "Failed to load graph.", true);
    } finally {
      setLoadingGraph(false);
    }
  };

  const handleStartDrag = (event, node) => {
    event.preventDefault();

    const rect = canvasRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setDragging({
      noteId: node.noteId,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y,
    });
  };

  // Traceability: UC-24 saves the updated positions of notes in the graph.
  const handleSaveGraph = async () => {
    if (!selectedGraph) {
      showStatus("Select a graph first.", true);
      return;
    }

    setSaving(true);

    try {
      const result = await updateGraph(selectedGraph.graphId, {
        graphName,
        tagIds: selectedTags.map((tag) => tag.tagId),
        nodes,
        edges,
      });

      setSelectedGraph(result.graph);
      showStatus("Graph layout saved.");
      await loadGraphs();
    } catch (error) {
      console.error("Error saving graph updates:", error);
      showStatus(error.message || "Failed to save graph changes.", true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="folders-page">
      <div className="panel panel-left">
        <div className="panel-header">
          <h2>📈 Saved Graphs</h2>
        </div>

        <div className="notes-tree">
          {loading && <p className="hint">Loading graphs…</p>}
          {!loading && errorMsg && <p className="note-tags-empty">{errorMsg}</p>}

          {!loading && !errorMsg && graphs.length === 0 && (
            <p className="note-tags-empty">No saved graphs yet.</p>
          )}

          {!loading && !errorMsg && graphs.map((graph) => (
            <button
              key={graph.graphId}
              type="button"
              className={`note-card graph-list-card${selectedGraph?.graphId === graph.graphId ? " active" : ""}`}
              onClick={() => openGraph(graph)}
            >
              <h3 className="graph-card-title">{graph.graphName || graph.graphname}</h3>
              <p className="graph-card-meta">
                Created {graph.dateCreated ? new Date(graph.dateCreated).toLocaleString() : "Unknown"}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="panel panel-right">
        {!selectedGraph ? (
          <div className="empty-editor">
            <div className="empty-state">
              <span>📊</span>
              <p>Click a saved graph on the left to open and edit it.</p>
            </div>
          </div>
        ) : loadingGraph ? (
          <div className="empty-editor">
            <div className="empty-state">
              <span>⏳</span>
              <p>Loading graph…</p>
            </div>
          </div>
        ) : (
          <div className="merge-canvas-shell graph-detail-shell">
            <div className="merge-toolbar">
              <div className="merge-toolbar-left">
                <h2>📈 Edit Saved Graph</h2>
                <p>Drag the note rectangles to reorganize the graph, then save it again.</p>
                {selectedTags.length > 0 && (
                  <div className="merge-tag-summary">
                    {selectedTags.map((tag) => (
                      <span key={tag.tagId} className="merge-tag-pill">#{tag.tagName}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="merge-toolbar-actions">
                <input
                  type="text"
                  className="merge-input"
                  value={graphName}
                  onChange={(event) => setGraphName(event.target.value)}
                  placeholder="Graph name"
                />
                <button type="button" className="merge-btn-success" onClick={handleSaveGraph} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="merge-canvas-wrapper">
              <div
                ref={canvasRef}
                className="merge-canvas"
                style={{ width: `${canvasSize.width}px`, height: `${canvasSize.height}px` }}
              >
                <svg width={canvasSize.width} height={canvasSize.height}>
                  {edges.map((edge, index) => {
                    const sourceNode = nodeMap[edge.sourceNoteId];
                    const targetNode = nodeMap[edge.targetNoteId];

                    if (!sourceNode || !targetNode) {
                      return null;
                    }

                    return (
                      <line
                        key={`${edge.sourceNoteId}-${edge.targetNoteId}-${index}`}
                        x1={(sourceNode.x || 0) + (sourceNode.width || 220)}
                        y1={(sourceNode.y || 0) + ((sourceNode.height || 120) / 2)}
                        x2={targetNode.x || 0}
                        y2={(targetNode.y || 0) + ((targetNode.height || 120) / 2)}
                        stroke="#64748b"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>

                {nodes.map((node) => (
                  <div
                    key={node.noteId}
                    className="merge-note-card"
                    style={{
                      left: `${node.x || 0}px`,
                      top: `${node.y || 0}px`,
                      width: `${node.width || 220}px`,
                      minHeight: `${node.height || 120}px`,
                    }}
                    onMouseDown={(event) => handleStartDrag(event, node)}
                  >
                    <h4>{node.title}</h4>
                    <span className="merge-note-meta">
                      Created {new Date(node.dateCreated).toLocaleDateString()}
                    </span>
                    <div className="merge-note-tags">
                      {(node.matchingTags || []).map((tag) => (
                        <span key={`${node.noteId}-${tag.tagId}`} className="merge-note-tag">
                          #{tag.tagName}
                        </span>
                      ))}
                    </div>
                    <p className="merge-note-preview">
                      {(node.content || "No content available.").slice(0, 90)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {statusMsg && (
        <div className={`merge-status-toast ${statusMsg.error ? "error" : "success"}`}>
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}
