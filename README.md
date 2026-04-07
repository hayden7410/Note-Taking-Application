# Note-Taking Application

A full-stack **note-taking and graph visualization app** built with:
- **React** frontend
- **Node.js / Express** backend
- **MySQL** database

This project supports user authentication, folders, notes, tags, note filtering by tags, merge-note graphs, and saved graph layouts.

---

## Features

### Authentication
- Register a new account
- Log in with email and password
- Log out from the top-right navigation
- Protected routes for authenticated users only

### Notes and Folders
- Create, edit, move, and delete notes
- Create folders to organize notes
- Keep notes and folders **scoped to the logged-in user**

### Tags
- Create tags and attach them to notes
- Edit tag names
- Remove tags from notes
- Filter notes by selected tags

### Merge Notes Graph
- Select one or more tags and generate a merge graph
- Notes are arranged **oldest first from left to right**
- Notes sharing tags are connected with a single line
- Drag note rectangles around the canvas
- Save the graph into the database

### Saved Graphs
- View all saved graphs from the database
- Open a saved graph from the left panel
- Reorganize it again by dragging nodes
- Save the updated layout again

---

## Project Structure

```text
Note-Taking-Apliciation/
├── README.md
└── Note Taking Application/
    ├── backend/
    └── frontend/
```

---

## Requirements

Before running the project, install:

1. **Node.js**
   - https://nodejs.org/en/
   - Verify:
   ```bash
   node -v
   npm -v
   ```

2. **MySQL Community Server**
   - https://dev.mysql.com/downloads/installer/

---

## Database Setup

1. Open MySQL
2. Create a database named:

```sql
CREATE DATABASE crud_app;
```

3. Update the backend database credentials in:
- `Note Taking Application/backend/src/config/db.js`

Current project default:
- host: `localhost`
- user: `root`
- password: `123456`
- database: `crud_app`

4. Run your schema using:
- `Note Taking Application/backend/schema.sql`

> Make sure your added graph tables (`graph_tags`, `graph_nodes`, `graph_edges`) are already present, since the merge-notes graph feature depends on them.

---

## Install Dependencies

### Backend
Open a terminal in:
`Note Taking Application/backend`

```bash
npm install
```

### Frontend
Open a second terminal in:
`Note Taking Application/frontend`

```bash
npm install
```

---

## Run the Project

### Start the backend
From `Note Taking Application/backend`:

```bash
npm start
```

Backend runs on:
```text
http://localhost:8800
```

### Start the frontend
From `Note Taking Application/frontend`:

```bash
npm start
```

Frontend runs on:
```text
http://localhost:3000
```

---

## Main Routes

### Frontend
- `/login` — Login page
- `/register` — Register page
- `/folders` — Notes and folders page
- `/merge-notes` — Generate and save note graphs
- `/graphs` — View and edit saved graphs

### Backend API
- `/api/auth`
- `/api/folders`
- `/api/notes`
- `/api/tags`
- `/api/graphs`

---

## Notes

- This app uses **JWT-based authentication** for protected backend routes.
- Notes, folders, tags, and saved graphs are all tied to the authenticated user.
- If login works but pages do not load correctly, make sure the backend server is running and MySQL is connected.

---

## Development Notes

Useful commands:

### Backend
```bash
npm start
npm run dev
```

### Frontend
```bash
npm start
npm run build
```

---

## Pending Use Cases

The following use cases are not fully implemented in the current codebase:

- UC-03 User reset password.
- UC-04 User change password.
- UC-06 User insert content into the note using drawing tools. Text entry is implemented, but drawing is not.
- UC-14 User search notes by keywords.
- UC-16 User re-arrange notes by ascending date or descending date from the notes UI.
- UC-19 User delete folder. Backend support exists, but the current folders UI does not expose this flow.
- UC-20 User rename the title of the folder. Backend support exists, but the current folders UI does not expose this flow.
- UC-21 User view notes version history. The schema includes history storage, but no API or UI flow is implemented.
- UC-22 Admin get system performance report.
- UC-23 Admin manage users.
- UC-25 User export note as PDF.

---

## Author
Gia Hung Nguyen