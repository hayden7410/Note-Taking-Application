# Note-Taking Application - API Documentation

## Base URL
```
http://localhost:8800
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string) - User email address
- `password` (string) - User password

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "userid": 1,
    "user": null,
    "email": "user@example.com",
    "loggedin": 0
  }
}
```

**Error Responses:**
- `400` - Email and password are required
- `409` - Email is already registered
- `500` - Server error

---

### POST /api/auth/login
Login with email and password.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Required Fields:**
- `email` (string) - User email address
- `password` (string) - User password

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "userid": 1,
    "user": null,
    "email": "user@example.com",
    "loggedin": 1
  }
}
```

**Error Responses:**
- `400` - Email and password are required
- `401` - Invalid email or password
- `500` - Server error

---

## Folder Endpoints

### GET /api/folders
Get all folders for a specific user.

**Query Parameters:**
- `userId` (required, integer) - User ID

**Example:**
```
GET http://localhost:8800/api/folders?userId=1
```

**Success Response (200):**
```json
[
  {
    "folderid": 1,
    "foldername": "My Notes",
    "userid": 1,
    "parentfolderid": null,
    "datecreated": "2024-01-15T10:30:00.000Z"
  },
  {
    "folderid": 2,
    "foldername": "Work",
    "userid": 1,
    "parentfolderid": 1,
    "datecreated": "2024-01-16T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `400` - userId is required
- `500` - Server error

---

### GET /api/folders/:folderId
Get a specific folder by ID.

**Path Parameters:**
- `folderId` (required, integer) - Folder ID

**Example:**
```
GET http://localhost:8800/api/folders/1
```

**Success Response (200):**
```json
{
  "folderid": 1,
  "foldername": "My Notes",
  "userid": 1,
  "parentfolderid": null,
  "datecreated": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404` - Folder not found
- `500` - Server error

---

### POST /api/folders
Create a new folder.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "folderName": "My Notes",
  "userId": 1,
  "parentFolderId": null
}
```

**Required Fields:**
- `folderName` (string) - Name of the folder
- `userId` (integer) - User ID who owns the folder

**Optional Fields:**
- `parentFolderId` (integer) - Parent folder ID for nested folders (defaults to null)

**Success Response (201):**
```json
{
  "message": "Folder created successfully",
  "folder": {
    "folderid": 1,
    "foldername": "My Notes",
    "userid": 1,
    "parentfolderid": null,
    "datecreated": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - folderName and userId are required
- `409` - A folder with that name already exists
- `500` - Server error

---

### PUT /api/folders/:folderId
Rename a folder.

**Path Parameters:**
- `folderId` (required, integer) - Folder ID

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "folderName": "Updated Folder Name"
}
```

**Required Fields:**
- `folderName` (string) - New folder name

**Success Response (200):**
```json
{
  "message": "Folder renamed successfully"
}
```

**Error Responses:**
- `400` - folderName is required
- `404` - Folder not found
- `500` - Server error

---

### DELETE /api/folders/:folderId
Delete a folder.

**Path Parameters:**
- `folderId` (required, integer) - Folder ID

**Example:**
```
DELETE http://localhost:8800/api/folders/1
```

**Success Response (200):**
```json
{
  "message": "Folder deleted successfully"
}
```

**Error Responses:**
- `404` - Folder not found
- `500` - Server error

---

## Note Endpoints

### GET /api/notes
Get all notes for a specific user.

**Query Parameters:**
- `userId` (required, integer) - User ID

**Example:**
```
GET http://localhost:8800/api/notes?userId=1
```

**Success Response (200):**
```json
[
  {
    "noteid": 1,
    "title": "My First Note",
    "content": "This is the content of my note",
    "userid": 1,
    "folderid": null,
    "datecreated": "2024-01-15T10:30:00.000Z",
    "datemodified": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `400` - userId is required
- `500` - Server error

---

### GET /api/notes/unfoldered
Get all notes without a folder for a specific user.

**Query Parameters:**
- `userId` (required, integer) - User ID

**Example:**
```
GET http://localhost:8800/api/notes/unfoldered?userId=1
```

**Success Response (200):**
```json
[
  {
    "noteid": 2,
    "title": "Quick Note",
    "content": "A note without a folder",
    "userid": 1,
    "folderid": null,
    "datecreated": "2024-01-16T10:30:00.000Z",
    "datemodified": "2024-01-16T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `400` - userId is required
- `500` - Server error

---

### GET /api/notes/folder/:folderId
Get all notes inside a folder.

**Path Parameters:**
- `folderId` (required, integer) - Folder ID

**Example:**
```
GET http://localhost:8800/api/notes/folder/1
```

**Success Response (200):**
```json
[
  {
    "noteid": 1,
    "title": "My First Note",
    "content": "This is the content of my note",
    "userid": 1,
    "folderid": 1,
    "datecreated": "2024-01-15T10:30:00.000Z",
    "datemodified": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `500` - Server error

---

### GET /api/notes/:noteId
Get a specific note by ID.

**Path Parameters:**
- `noteId` (required, integer) - Note ID

**Example:**
```
GET http://localhost:8800/api/notes/1
```

**Success Response (200):**
```json
{
  "noteid": 1,
  "title": "My First Note",
  "content": "This is the content of my note",
  "userid": 1,
  "folderid": null,
  "datecreated": "2024-01-15T10:30:00.000Z",
  "datemodified": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404` - Note not found
- `500` - Server error

---

### POST /api/notes
Create a new note.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "My Note Title",
  "content": "This is the note content",
  "userId": 1,
  "folderId": null
}
```

**Required Fields:**
- `title` (string) - Note title
- `userId` (integer) - User ID who owns the note

**Optional Fields:**
- `content` (string) - Note content (defaults to empty string)
- `folderId` (integer) - Folder ID where this note belongs (defaults to null)

**Success Response (201):**
```json
{
  "message": "Note created successfully",
  "note": {
    "noteid": 1,
    "title": "My Note Title",
    "content": "This is the note content",
    "userid": 1,
    "folderid": null,
    "datecreated": "2024-01-15T10:30:00.000Z",
    "datemodified": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - title and userId are required
- `500` - Server error

---

### PUT /api/notes/:noteId
Update a note.

**Path Parameters:**
- `noteId` (required, integer) - Note ID

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content"
}
```

**Required Fields:**
- `title` (string) - Updated note title

**Optional Fields:**
- `content` (string) - Updated note content

**Success Response (200):**
```json
{
  "message": "Note updated successfully"
}
```

**Error Responses:**
- `400` - title is required
- `404` - Note not found
- `500` - Server error

---

### DELETE /api/notes/:noteId
Delete a note.

**Path Parameters:**
- `noteId` (required, integer) - Note ID

**Example:**
```
DELETE http://localhost:8800/api/notes/1
```

**Success Response (200):**
```json
{
  "message": "Note deleted successfully"
}
```

**Error Responses:**
- `404` - Note not found
- `500` - Server error

---

## Testing with Thunder Client

### Step-by-Step Guide:

1. **Open Thunder Client** (in VS Code)
2. **Create a new request**
3. **Select HTTP method** (GET, POST, PUT, DELETE)
4. **Paste the URL**
5. **Add Headers** (for POST/PUT requests):
   ```
   Content-Type: application/json
   ```
6. **Add Body** (for POST/PUT requests) - Click "Body" tab, select "JSON", paste your data
7. **Click "Send"**

---

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success (GET, PUT, DELETE) |
| `201` | Created (POST successful) |
| `400` | Bad Request (missing required fields) |
| `401` | Unauthorized (invalid credentials) |
| `404` | Not Found (resource doesn't exist) |
| `409` | Conflict (duplicate entry) |
| `500` | Server Error |

---

## Notes

- Make sure the backend server is running: `npm start` (in backend folder)
- For GET requests with query parameters, append them to the URL: `?userId=1`
- For path parameters, replace `:paramName` with actual values
- All dates are returned in ISO 8601 format
