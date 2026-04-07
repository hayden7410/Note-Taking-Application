// frontend/src/pages/Folders.js
// Place this file at: frontend/src/pages/Folders.js

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Folders.css";
import { getCurrentUser, logout } from "../Services/authApi.js";
import { createFolder, getFoldersByUser } from "../Services/folderApi.js";
import {
  createNote,
  deleteNote,
  getNotesByUser,
  moveNoteToFolder,
  updateNote,
} from "../Services/noteApi.js";
import {
  createTag as createTagApi,
  getNotesByTag as getNotesByTagApi,
  getTagsByNote,
  getTagsByUser,
  removeTagFromNote as removeTagFromNoteApi,
  updateTag as updateTagApi,
} from "../Services/tagApi.js";

// Traceability:
// UC-05 User creates a note.
// UC-06 User inserts note content through text editing in the UI.
// UC-07 User saves a note.
// UC-08 User modifies a note.
// UC-09 User tags a note.
// UC-10 User deletes a note.
// UC-11 User reads a note.
// UC-13 User relocates notes into another folder.
// UC-15 User searches notes by tags.
// UC-17 User renames the title of the note.
// UC-18 User creates a folder.

// ─── Small helper components ──────────────────────────────────────────────────

function FolderNode({ folder, selectedId, onSelect, onRename, onDelete, onCreateSub, level = 0 }) {
  const isSelected = folder.folderId === selectedId;

  return (
    <div className="folder-node" style={{ marginLeft: level * 20 }}>
      <div
        className={`folder-row ${isSelected ? "selected" : ""}`}
        onClick={() => onSelect(folder.folderId)}
      >
        <span className="folder-icon">📁</span>
        <span className="folder-name">{folder.folderName}</span>
        <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="btn-icon" title="Create sub-folder" onClick={() => onCreateSub(folder.folderId)}>＋</button>
          <button type="button" className="btn-icon" title="Rename" onClick={() => onRename(folder.folderId, folder.folderName)}>✏️</button>
          <button type="button" className="btn-icon danger" title="Delete" onClick={() => onDelete(folder.folderId, folder.folderName)}>🗑</button>
        </div>
      </div>

      {/* Render sub-folders recursively */}
      {folder.subFolders && folder.subFolders.map((sub) => (
        <FolderNode
          key={sub.folderId}
          folder={sub}
          selectedId={selectedId}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
          onCreateSub={onCreateSub}
          level={level + 1}
        />
      ))}
    </div>
  );
}

// ─── Main Folders Page ────────────────────────────────────────────────────────

export default function Folders() {
  const navigate = useNavigate();

  const [folderTree,      setFolderTree]      = useState([]);
  const [allNotes,        setAllNotes]        = useState({}); // {folderId: [notes], null: [unfolderedNotes]}
  const [selectedNote,    setSelectedNote]    = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [statusMsg,       setStatusMsg]       = useState("");
  const [loading,         setLoading]         = useState(false);
  const [noteTags,        setNoteTags]        = useState([]);
  const [availableTags,   setAvailableTags]   = useState([]);
  const [selectedTagId,   setSelectedTagId]   = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState(null);
  const [filteredNotes,   setFilteredNotes]   = useState([]);

  // Modal state
  const [modal, setModal] = useState(null);
  const [noteActionTargetFolder, setNoteActionTargetFolder] = useState(null);
  // modal = { type: "create"|"createNote"|"createSub"|"rename"|"delete"|"move",
  //           folderId?, oldName?, noteId? }
  const [inputValue, setInputValue] = useState("");
  const [createNoteTitle, setCreateNoteTitle] = useState("untitled");
  const [createNoteContent, setCreateNoteContent] = useState("");

  useEffect(() => {
    if (!getCurrentUser()) {
      logout();
      navigate("/login");
    }
  }, [navigate]);

  const handleAuthError = useCallback((error) => {
    if (error.message === "Authentication required" || error.message === "Invalid or expired token") {
      logout();
      navigate("/login");
      return true;
    }

    return false;
  }, [navigate]);

  // ─── Data fetching ───────────────────────────────────────────────────────────

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFoldersByUser();
      const tree = buildTree(data || []);
      setFolderTree(tree);
    } catch (error) {
      console.error("Error fetching folders:", error);
      if (handleAuthError(error)) {
        return;
      }
      setFolderTree([]);
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const fetchAllNotes = useCallback(async () => {
    try {
      const data = await getNotesByUser();

      // Group notes by folderId
      const grouped = {};
      data.forEach(note => {
        const folderId = note.folderId;
        if (!grouped[folderId]) {
          grouped[folderId] = [];
        }
        grouped[folderId].push(note);
      });
      
      setAllNotes(grouped);
    } catch (error) {
      console.error("Error fetching all notes:", error);
      if (handleAuthError(error)) {
        return;
      }
      setAllNotes({});
    }
  }, [handleAuthError]);

  const fetchTagsForNote = useCallback(async (noteId) => {
    if (!noteId) {
      setNoteTags([]);
      return;
    }

    try {
      const tags = await getTagsByNote(noteId);
      setNoteTags(tags);
    } catch (error) {
      console.error("Error fetching note tags:", error);
      if (handleAuthError(error)) {
        return;
      }
      setNoteTags([]);
    }
  }, [handleAuthError]);

  const fetchAvailableTags = useCallback(async () => {
    try {
      const tags = await getTagsByUser();
      setAvailableTags(tags);
      return tags;
    } catch (error) {
      console.error("Error fetching all tags:", error);
      if (handleAuthError(error)) {
        return [];
      }
      setAvailableTags([]);
      return [];
    }
  }, [handleAuthError]);

  const applyTagFilter = useCallback(async (tagId, fallbackName = "") => {
    try {
      const data = await getNotesByTagApi(tagId);
      setActiveTagFilter(data.tag || { tagId, tagName: fallbackName });
      setFilteredNotes(data.notes || []);
    } catch (error) {
      console.error("Error filtering notes by tag:", error);
      showStatus(error.message || "Error filtering notes by tag.", true);
    }
  }, []);

  useEffect(() => { 
    fetchTree(); 
    fetchAllNotes();
    fetchAvailableTags();
  }, [fetchTree, fetchAllNotes, fetchAvailableTags]);

  useEffect(() => {
    if (selectedNote?.noteId) {
      fetchTagsForNote(selectedNote.noteId);
    } else {
      setNoteTags([]);
    }
  }, [selectedNote?.noteId, fetchTagsForNote]);

  // ─── Folder expansion and note selection handlers ────────────────────────────

  const toggleFolderExpansion = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const selectNote = (note) => {
    setSelectedNote(note);
  };

  // ─── Status message helper ────────────────────────────────────────────────────

  const showStatus = (msg, isError = false) => {
    setStatusMsg({ text: msg, error: isError });
    setTimeout(() => setStatusMsg(""), 3000);
  };

  // ─── Modal handlers ──────────────────────────────────────────────────────────

  const closeModal = () => {
    setModal(null);
    setInputValue("");
    setCreateNoteTitle("untitled");
    setCreateNoteContent("");
    setSelectedTagId("");
  };
  const openCreateFolderModal = () => { setInputValue(""); setModal({ type: "create" }); };
  const openCreateNoteModal = () => { setCreateNoteTitle("untitled"); setCreateNoteContent(""); setModal({ type: "createNote" }); };
  const openCreateTagModal = () => {
    if (!selectedNote) {
      showStatus("Select a note first.", true);
      return;
    }

    setInputValue("");
    setModal({ type: "createTag" });
  };
  const openFilterTagModal = async () => {
    const tags = await fetchAvailableTags();

    if (!tags || tags.length === 0) {
      showStatus("Create a tag first before filtering notes.", true);
      return;
    }

    const defaultTag = noteTags[0] || tags[0];
    setSelectedTagId(String(defaultTag.tagId));
    setModal({ type: "filterTag" });
  };
  const openEditTagModal = () => {
    if (!selectedNote) {
      showStatus("Select a note first.", true);
      return;
    }

    if (noteTags.length === 0) {
      showStatus("This note has no tags yet.", true);
      return;
    }

    setSelectedTagId(String(noteTags[0].tagId));
    setInputValue(noteTags[0].tagName);
    setModal({ type: "editTag" });
  };

  const handleClearTagFilter = () => {
    setActiveTagFilter(null);
    setFilteredNotes([]);
  };

  // Traceability: UC-18 creates a folder from the folders page.
  const handleCreate = async () => {
    if (!inputValue.trim()) return;

    try {
      await createFolder(inputValue.trim());
      showStatus("Folder created!");
      await fetchTree();
      closeModal();
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      showStatus(error.message || "Error creating folder.", true);
    }
  };

  // Traceability: UC-05 and UC-06 create a note with initial text content.
  const handleCreateNote = async () => {
    const title = createNoteTitle.trim() || "untitled";

    try {
      const data = await createNote(title, createNoteContent || "", null);
      showStatus("Note created!");
      await fetchAllNotes();
      closeModal();
      if (data.note) {
        setSelectedNote(data.note);
      }
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      showStatus(error.message || "Error creating note.", true);
    }
  };

  // Traceability: UC-07, UC-08, and UC-17 persist note content and title changes.
  const handleSaveNote = async () => {
    if (!selectedNote) return;

    try {
      await updateNote(selectedNote.noteId, selectedNote.title, selectedNote.content || "");
      showStatus("Note saved!");
      await fetchAllNotes();
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      showStatus(error.message || "Error saving note.", true);
    }
  };

  // Traceability: UC-09 attaches a tag to the selected note.
  const handleCreateTag = async () => {
    if (!selectedNote || !inputValue.trim()) return;

    try {
      const data = await createTagApi(inputValue.trim(), selectedNote.noteId);
      showStatus(data.message || "Tag saved!");
      await fetchTagsForNote(selectedNote.noteId);
      await fetchAvailableTags();
      closeModal();
    } catch (error) {
      showStatus(error.message || "Error creating tag.", true);
    }
  };

  // Traceability: UC-15 filters notes by the selected tag.
  const handleApplyTagFilter = async () => {
    if (!selectedTagId) return;

    const matchingTag = availableTags.find((tag) => String(tag.tagId) === String(selectedTagId))
      || noteTags.find((tag) => String(tag.tagId) === String(selectedTagId));

    await applyTagFilter(selectedTagId, matchingTag?.tagName || "Selected Tag");
    closeModal();
  };

  // Traceability: UC-09 updates an existing tag label.
  const handleEditTag = async () => {
    if (!selectedNote || !selectedTagId || !inputValue.trim()) return;

    try {
      await updateTagApi(selectedTagId, inputValue.trim());
      showStatus("Tag updated!");
      await fetchTagsForNote(selectedNote.noteId);
      await fetchAvailableTags();

      if (activeTagFilter && Number(selectedTagId) === Number(activeTagFilter.tagId)) {
        await applyTagFilter(selectedTagId, inputValue.trim());
      }

      closeModal();
    } catch (error) {
      showStatus(error.message || "Error updating tag.", true);
    }
  };

  // Traceability: UC-09 removes a tag association from the selected note.
  const handleRemoveTag = async (tagId) => {
    if (!selectedNote) return;

    try {
      await removeTagFromNoteApi(tagId, selectedNote.noteId);
      showStatus("Tag removed from note.");
      await fetchTagsForNote(selectedNote.noteId);
      await fetchAvailableTags();

      if (activeTagFilter && Number(tagId) === Number(activeTagFilter.tagId)) {
        await applyTagFilter(tagId, activeTagFilter.tagName);
      }
    } catch (error) {
      showStatus(error.message || "Error removing tag.", true);
    }
  };

  const openNoteActions = (note) => {
    setNoteActionTargetFolder(note.folderId ?? "");
    setModal({ type: "noteActions", note });
  };

  // Traceability: UC-13 moves a note to a different folder or back to unfoldered.
  const handleMoveNoteToFolder = async () => {
    if (!modal?.note) return;
    const folderId = noteActionTargetFolder === "" ? null : Number(noteActionTargetFolder);

    try {
      await moveNoteToFolder(modal.note.noteId, folderId);
      showStatus("Note moved!");
      await fetchAllNotes();
      closeModal();
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      showStatus(error.message || "Error moving note.", true);
    }
  };

  // Traceability: UC-10 deletes the selected note.
  const handleDeleteNote = async () => {
    if (!modal?.note) return;

    try {
      await deleteNote(modal.note.noteId);
      showStatus("Note deleted!");
      if (selectedNote?.noteId === modal.note.noteId) setSelectedNote(null);
      await fetchAllNotes();

      if (activeTagFilter) {
        await applyTagFilter(activeTagFilter.tagId, activeTagFilter.tagName);
      }

      closeModal();
    } catch (error) {
      if (handleAuthError(error)) {
        return;
      }
      showStatus(error.message || "Error deleting note.", true);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  // Traceability: UC-11 lets the user open and read a note from the tree.
  // Helper function to render folder tree item
  const renderFolderItem = (folder) => {
    const isExpanded = expandedFolders.has(folder.folderId);
    const notesInFolder = allNotes[folder.folderId] || [];
    
    return (
      <div key={folder.folderId} className="folder-tree-item">
        <div 
          className="folder-tree-row"
          onClick={() => toggleFolderExpansion(folder.folderId)}
        >
          <span className="folder-toggle">
            {notesInFolder.length > 0 ? (isExpanded ? '▼' : '▶') : '📁'}
          </span>
          <span className="folder-name">{folder.folderName}</span>
          <span className="note-count">({notesInFolder.length})</span>
        </div>
        
        {isExpanded && notesInFolder.length > 0 && (
          <div className="folder-notes">
            {notesInFolder.map(note => (
              <div 
                key={note.noteId} 
                className={`note-tree-item${selectedNote?.noteId === note.noteId ? ' selected-note' : ''}`}
              >
                <button type="button" className="note-tree-link" onClick={() => selectNote(note)}>
                  📄 {note.title}
                </button>
                <button type="button" className="note-action-btn" onClick={(e) => { e.stopPropagation(); openNoteActions(note); }}>
                  …
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Render sub-folders recursively */}
        {folder.subFolders && folder.subFolders.map((sub) => (
          <div key={sub.folderId} className="sub-folder">
            {renderFolderItem(sub)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="folders-page">

      {/* ── Left Panel: Folder Tree & Notes ────────────────────────────── */}
      <div className="panel panel-left">
        <div className="panel-header">
          <h2>📂 My Notes</h2>
          <div className="panel-header-actions">
            <button type="button" className="btn-secondary btn-small" onClick={openCreateNoteModal}>＋ New Note</button>
            <button type="button" className="btn-primary btn-small" onClick={openCreateFolderModal}>＋ New Folder</button>
          </div>
        </div>

        {loading && <p className="hint">Loading…</p>}

        {!loading && (
          <div className="notes-tree">
            {activeTagFilter ? (
              <div className="tag-filter-view">
                <div className="tag-filter-banner">
                  <div className="tag-filter-info">
                    <strong>🏷️ #{activeTagFilter.tagName}</strong>
                    <span>Showing all notes with this tag</span>
                  </div>
                  <button type="button" className="btn-secondary btn-small" onClick={handleClearTagFilter}>
                    Clear Filter
                  </button>
                </div>

                <div className="folder-notes tag-filter-list">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => (
                      <div
                        key={note.noteId}
                        className={`note-tree-item${selectedNote?.noteId === note.noteId ? ' selected-note' : ''}`}
                      >
                        <button type="button" className="note-tree-link" onClick={() => selectNote(note)}>
                          📄 {note.title}
                        </button>
                        <button type="button" className="note-action-btn" onClick={(e) => { e.stopPropagation(); openNoteActions(note); }}>
                          …
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="note-tags-empty">No notes found for this tag.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Folders */}
                {folderTree.map((folder) => renderFolderItem(folder))}
                
                {/* Unfoldered Notes */}
                <div className="unfoldered-section">
                  <div className="unfoldered-header">
                    <span className="folder-toggle">📄</span>
                    <span className="folder-name">Unfoldered Notes</span>
                    <span className="note-count">({(allNotes[null] || []).length})</span>
                  </div>
                  <div className="folder-notes">
                    {(allNotes[null] || []).map(note => (
                      <div 
                        key={note.noteId} 
                        className={`note-tree-item${selectedNote?.noteId === note.noteId ? ' selected-note' : ''}`}
                      >
                        <button type="button" className="note-tree-link" onClick={() => selectNote(note)}>
                          📄 {note.title}
                        </button>
                        <button type="button" className="note-action-btn" onClick={(e) => { e.stopPropagation(); openNoteActions(note); }}>
                          …
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Right Panel: Note Editor ───────────────────────────────────── */}
      <div className="panel panel-right">
        {selectedNote ? (
          <>
            <div className="panel-header">
              <h2>📝 Edit Note</h2>
              <div className="panel-header-actions note-tag-actions">
                <button type="button" className="btn-secondary btn-small" onClick={openFilterTagModal}>
                  🏷️ Filter Tag
                </button>
                <button type="button" className="btn-secondary btn-small" onClick={openEditTagModal}>
                  ✏️ Edit Tag
                </button>
                <button type="button" className="btn-primary btn-small" onClick={openCreateTagModal}>
                  ＋ Create Tag
                </button>
              </div>
            </div>
            <div className="note-editor">
              <input
                type="text"
                className="note-title-input"
                value={selectedNote.title}
                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})}
                placeholder="Note title..."
              />
              <div className="note-tags-section">
                <div className="note-tags-label">Tags</div>
                <div className="note-tags-list">
                  {noteTags.length > 0 ? (
                    noteTags.map((tag) => (
                      <span key={tag.tagId} className="tag-chip">
                        #{tag.tagName}
                        <button type="button" title="Remove tag from note" onClick={() => handleRemoveTag(tag.tagId)}>
                          ×
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="note-tags-empty">No tags on this note yet.</span>
                  )}
                </div>
              </div>
              <textarea
                className="note-content-input"
                value={selectedNote.content || ''}
                onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value})}
                placeholder="Note content..."
              />
              <div className="note-actions">
                <button type="button" className="btn-primary" onClick={handleSaveNote}>
                  Save Changes
                </button>
                <button type="button" className="btn-secondary" onClick={() => setSelectedNote(null)}>
                  Close
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-editor">
            <div className="empty-state">
              <span>📝</span>
              <p>Select a note from the left panel to start editing</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Status Message ─────────────────────────────────── */}
      {statusMsg && (
        <div className={`status-toast ${statusMsg.error ? "error" : "success"}`}>
          {statusMsg.text}
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────── */}
      {modal && (
        <div className="folders-modal-overlay" onClick={closeModal}>
          <div className="folders-modal" onClick={(e) => e.stopPropagation()}>

            {/* Create Folder */}
            {modal.type === "create" && (
              <>
                <h3>Create Folder</h3>
                <input
                  autoFocus
                  type="text"
                  placeholder="Folder name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={handleCreate}>
                    Create
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

            {modal.type === "createNote" && (
              <>
                <h3>Create Note</h3>
                <label className="modal-label">Title</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="Note title"
                  value={createNoteTitle}
                  onChange={(e) => setCreateNoteTitle(e.target.value)}
                />
                <label className="modal-label">Content</label>
                <textarea
                  className="modal-textarea"
                  rows={6}
                  placeholder="Note content..."
                  value={createNoteContent}
                  onChange={(e) => setCreateNoteContent(e.target.value)}
                />
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={handleCreateNote}>
                    Create Note
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

            {modal.type === "createTag" && (
              <>
                <h3>Create Tag</h3>
                <label className="modal-label">Tag name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="e.g. urgent, school, ideas"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                />
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={handleCreateTag}>
                    Save Tag
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

            {modal.type === "filterTag" && (
              <>
                <h3>Filter Notes by Tag</h3>
                <label className="modal-label">Choose tag</label>
                <select
                  value={selectedTagId}
                  onChange={(e) => setSelectedTagId(e.target.value)}
                >
                  {availableTags.map((tag) => (
                    <option key={tag.tagId} value={tag.tagId}>{tag.tagName}</option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={handleApplyTagFilter}>
                    Apply Filter
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

            {modal.type === "editTag" && (
              <>
                <h3>Edit Tag</h3>
                <label className="modal-label">Choose tag</label>
                <select
                  value={selectedTagId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setSelectedTagId(nextId);
                    const matchingTag = noteTags.find((tag) => String(tag.tagId) === nextId);
                    setInputValue(matchingTag?.tagName || "");
                  }}
                >
                  {noteTags.map((tag) => (
                    <option key={tag.tagId} value={tag.tagId}>{tag.tagName}</option>
                  ))}
                </select>
                <label className="modal-label">New tag name</label>
                <input
                  type="text"
                  placeholder="Rename tag"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEditTag()}
                />
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={handleEditTag}>
                    Update Tag
                  </button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

            {modal.type === "noteActions" && modal.note && (
              <>
                <h3>Note Actions</h3>
                <p><strong>{modal.note.title}</strong></p>
                <div className="folders-modal-field">
                  <label>Move to folder</label>
                  <select
                    value={noteActionTargetFolder ?? ""}
                    onChange={(e) => setNoteActionTargetFolder(e.target.value)}
                  >
                    <option value="">Unfoldered</option>
                    {flattenTree(folderTree).map((folder) => (
                      <option key={folder.folderId} value={folder.folderId}>{folder.label}</option>
                    ))}
                  </select>
                </div>
                <div className="modal-buttons">
                  <button type="button" className="btn-primary" onClick={handleMoveNoteToFolder}>Move</button>
                  <button type="button" className="btn-danger" onClick={handleDeleteNote}>Delete</button>
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// Build nested tree from flat array
function flattenTree(tree, prefix = "") {
  const result = [];
  tree.forEach((folder) => {
    result.push({
      folderId: folder.folderId,
      label: `${prefix}${folder.folderName}`,
    });
    if (folder.subFolders) {
      result.push(...flattenTree(folder.subFolders, `${prefix}  `));
    }
  });
  return result;
}

function buildTree(flatFolders) {
  const folderMap = {};
  const roots = [];

  // First pass: create map of all folders
  flatFolders.forEach(folder => {
    folderMap[folder.folderId] = { ...folder, subFolders: [] };
  });

  // Second pass: build tree structure
  flatFolders.forEach(folder => {
    if (folder.parentFolderId === null) {
      // Root folder
      roots.push(folderMap[folder.folderId]);
    } else {
      // Child folder
      const parent = folderMap[folder.parentFolderId];
      if (parent) {
        parent.subFolders.push(folderMap[folder.folderId]);
      }
    }
  });

  return roots;
}
