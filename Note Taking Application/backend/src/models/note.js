class Note {
  constructor(
    noteId,
    title,
    content,
    dateCreated,
    modifiedDate,
    folderId,
    userId
  ) {
    this.noteId = noteId;
    this.title = title;
    this.content = content;
    this.dateCreated = dateCreated;
    this.modifiedDate = modifiedDate;
    this.folderId = folderId;
    this.userId = userId;
  }
}

export default Note;