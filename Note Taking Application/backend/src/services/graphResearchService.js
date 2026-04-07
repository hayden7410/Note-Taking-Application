const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 120;
const DEFAULT_START_X = 60;
const DEFAULT_START_Y = 120;
const DEFAULT_GAP_X = 260;

const buildMergeResearch = (notes = [], selectedTags = []) => {
  const sortedNotes = [...notes].sort((a, b) => {
    const aDate = new Date(a.dateCreated).getTime();
    const bDate = new Date(b.dateCreated).getTime();

    if (aDate !== bDate) {
      return aDate - bDate;
    }

    return Number(a.noteId) - Number(b.noteId);
  });

  const nodes = sortedNotes.map((note, index) => ({
    noteId: note.noteId,
    title: note.title,
    content: note.content,
    dateCreated: note.dateCreated,
    modifiedDate: note.modifiedDate,
    folderId: note.folderId,
    userId: note.userId,
    matchingTags: note.matchingTags || [],
    x: DEFAULT_START_X + index * DEFAULT_GAP_X,
    y: DEFAULT_START_Y,
    width: DEFAULT_NODE_WIDTH,
    height: DEFAULT_NODE_HEIGHT,
    displayOrder: index,
  }));

  const edges = [];

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const sourceNode = nodes[i];
      const targetNode = nodes[j];

      const sharedTags = sourceNode.matchingTags.filter((sourceTag) =>
        targetNode.matchingTags.some((targetTag) => Number(targetTag.tagId) === Number(sourceTag.tagId))
      );

      if (sharedTags.length > 0) {
        edges.push({
          sourceNoteId: sourceNode.noteId,
          targetNoteId: targetNode.noteId,
          sharedTagId: sharedTags[0].tagId,
          sharedTagIds: sharedTags.map((tag) => tag.tagId),
          sharedTagNames: sharedTags.map((tag) => tag.tagName),
          relationType: "shared_tag",
        });
      }
    }
  }

  return {
    nodes,
    edges,
    research: {
      selectedTagIds: selectedTags.map((tag) => tag.tagId),
      noteCount: nodes.length,
      connectionCount: edges.length,
      connectedPairs: edges.map((edge) => ({
        sourceNoteId: edge.sourceNoteId,
        targetNoteId: edge.targetNoteId,
        sharedTagNames: edge.sharedTagNames,
      })),
    },
  };
};

export { buildMergeResearch };
