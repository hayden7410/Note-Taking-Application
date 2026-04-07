import express from "express"
import cors from "cors"; 

import authRoutes from "./src/routes/authRoutes.js";
import folderRoutes from "./src/routes/folderRoutes.js";
import noteRoutes from "./src/routes/noteRoutes.js";
import tagRoutes from "./src/routes/tagRoutes.js";
import graphRoutes from "./src/routes/graphRoutes.js";

const app = express();
const PORT = 8800;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Backend is running" });
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/graphs", graphRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});