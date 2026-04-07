import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MergeNotes.css";
import { getCurrentUser, logout } from "../Services/authApi.js";
import { getTagsByUser } from "../Services/tagApi.js";
import { generateMergePreview, getSavedGraphs, saveGraph as saveGraphApi } from "../Services/graphApi.js";

// Traceability:
// UC-12 User merges notes into a visual representation using tags.
// UC-24 User organizes the visual display of notes by dragging graph nodes.

export default function MergeNotes() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [graphName, setGraphName] = useState("Merged Notes Graph");
  const [savedGraphs, setSavedGraphs] = useState([]);
  const [researchSummary, setResearchSummary] = useState({ noteCount: 0, connectionCount: 0 });
  const [pickerOpen, setPickerOpen] = useState(true);
  const [loadingTags, setLoadingTags] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const showStatus = useCallback((text, error = false) => {
    setStatusMsg({ text, error });
    window.clearTimeout(window.__mergeToastTimer);
    window.__mergeToastTimer = window.setTimeout(() => setStatusMsg(null), 3000);
  }, []);

  useEffect(() => {
    if (!getCurrentUser()) {
      logout();
      navigate("/login");
    }
  }, [navigate]);

  const loadPageData = useCallback(async () => {
    setLoadingTags(true);

    try {
      const [tags, graphs] = await Promise.all([
        getTagsByUser(),
        getSavedGraphs().catch(() => []),
      ]);

      setAvailableTags(tags);
      setSavedGraphs(graphs);
    } catch (error) {
      console.error("Error loading merge notes data:", error);
      showStatus(error.message || "Failed to load tags for merge.", true);
    } finally {
      setLoadingTags(false);
    }
  }, [showStatus]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

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

    const handleMouseUp = () => {
      setDragging(null);
    };

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

  const toggleTagSelection = (tagId) => {
    setSelectedTagIds((prevIds) =>
      prevIds.includes(tagId)
        ? prevIds.filter((currentId) => currentId !== tagId)
        : [...prevIds, tagId]
    );
  };

  // Traceability: UC-12 generates the tag-based visual merge preview.
  const handleGenerateGraph = async () => {
    if (selectedTagIds.length === 0) {
      showStatus("Please select at least one tag.", true);
      return;
    }

    setGenerating(true);

    try {
      const preview = await generateMergePreview(selectedTagIds);
      setNodes(preview.nodes || []);
      setEdges(preview.edges || []);
      setSelectedTags(preview.tags || []);
      setResearchSummary(preview.research || { noteCount: 0, connectionCount: 0 });
      setGraphName(preview.graphName || "Merged Notes Graph");
      setPickerOpen(false);
      showStatus("Merge graph generated successfully.");
    } catch (error) {
      console.error("Error generating merge graph:", error);
      showStatus(error.message || "Failed to generate graph.", true);
    } finally {
      setGenerating(false);
    }
  };

  // Traceability: UC-24 persists the user-organized graph layout.
  const handleSaveGraph = async () => {
    if (nodes.length === 0) {
      showStatus("Generate a merge graph before saving.", true);
      return;
    }

    setSaving(true);

    try {
      const result = await saveGraphApi({
        graphName,
        tagIds: selectedTags.map((tag) => tag.tagId),
        nodes,
        edges,
      });

      showStatus(`Graph saved: ${result.graph.graphName}`);
      const graphs = await getSavedGraphs().catch(() => []);
      setSavedGraphs(graphs);
    } catch (error) {
      console.error("Error saving graph:", error);
      showStatus(error.message || "Failed to save graph.", true);
    } finally {
      setSaving(false);
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

  return (
    <div className="merge-notes-page">
      <div className="merge-toolbar">
        <div className="merge-toolbar-left">
          <h2>🧩 Merge Notes Graph</h2>
          <p>Select tags, generate linked notes, drag them into place, then save the graph.</p>
          {selectedTags.length > 0 && (
            <div className="merge-tag-summary">
              {selectedTags.map((tag) => (
                <span key={tag.tagId} className="merge-tag-pill">#{tag.tagName}</span>
              ))}
            </div>
          )}
        </div>

        <div className="merge-toolbar-actions">
          <button type="button" className="merge-btn-secondary" onClick={() => setPickerOpen(true)}>
            Select Tags
          </button>
          <input
            type="text"
            className="merge-input"
            value={graphName}
            onChange={(event) => setGraphName(event.target.value)}
            placeholder="Graph name"
          />
          <button type="button" className="merge-btn-success" onClick={handleSaveGraph} disabled={saving}>
            {saving ? "Saving..." : "Save Graph"}
          </button>
        </div>
      </div>

      <div className="merge-canvas-shell">
        <div className="merge-research-bar">
          <span><strong>{researchSummary.noteCount || 0}</strong> merged notes</span>
          <span><strong>{researchSummary.connectionCount || 0}</strong> shared-tag connections</span>
          {savedGraphs.length > 0 && <span><strong>{savedGraphs.length}</strong> saved graphs</span>}
        </div>

        <div className="merge-canvas-wrapper">
          {nodes.length === 0 ? (
            <div className="merge-empty-state">
              {loadingTags ? "Loading your tags..." : "Use the Merge Notes button and choose tags to generate the graph."}
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {pickerOpen && (
        <div className="merge-modal-overlay" onClick={() => setPickerOpen(false)}>
          <div className="merge-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Select tags to merge</h3>
            <p>Choose one or more tags. The system will bring in all matching notes, sort them by oldest first, and connect notes that share a tag.</p>

            <div className="merge-tag-list">
              {availableTags.length > 0 ? (
                availableTags.map((tag) => (
                  <label key={tag.tagId} className="merge-tag-option">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.tagId)}
                      onChange={() => toggleTagSelection(tag.tagId)}
                    />
                    <span>#{tag.tagName}</span>
                  </label>
                ))
              ) : (
                <p>No tags available yet. Create some tags from your notes first.</p>
              )}
            </div>

            <div className="merge-modal-actions">
              <button type="button" className="merge-btn-secondary" onClick={() => setPickerOpen(false)}>
                Cancel
              </button>
              <button type="button" className="merge-btn-primary" onClick={handleGenerateGraph} disabled={generating || availableTags.length === 0}>
                {generating ? "Generating..." : "Generate Graph"}
              </button>
            </div>
          </div>
        </div>
      )}

      {statusMsg && (
        <div className={`merge-status-toast ${statusMsg.error ? "error" : "success"}`}>
          {statusMsg.text}
        </div>
      )}
    </div>
  );
}
