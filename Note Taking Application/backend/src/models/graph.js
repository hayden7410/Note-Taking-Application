class Graph {
  constructor(graphId, graphName, userId, dateCreated, updatedAt = null) {
    this.graphId = graphId;
    this.graphName = graphName;
    this.userId = userId;
    this.dateCreated = dateCreated;
    this.updatedAt = updatedAt;
  }
}

export default Graph;
