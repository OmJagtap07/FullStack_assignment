# Low-Level Design (LLD)

## Folder Structure

### `client/` (Frontend)
- `src/components/`: Reusable UI elements (e.g., `Header`, layout wrappers).
- `src/context/`: Contains `AuthContext.jsx` for global state management of user sessions.
- `src/pages/`: Route-level components mapping directly to URLs (e.g., `Login.jsx`, `Dashboard.jsx`).
- `src/services/`: Contains `api.js`, the configured Axios instance with interceptors.

### `server/` (Backend)
- `config/`: Configuration files (`db.js` for MongoDB, `cloudinary.js`).
- `controllers/`: Core business logic (`authController.js`, `postController.js`, `userController.js`).
- `middleware/`: Express middleware (`auth.js` for JWT, `errorHandler.js`, `upload.js` for multer).
- `models/`: Mongoose schemas defining database structures.
- `routes/`: Express routers mapping URLs to controllers.
- `tests/`: Jest and Supertest integration testing files.

---

## Authentication Flow (JWT)

1. **Token Creation:** Inside `authController.js` (`loginUser`), `jwt.sign()` generates a token using `process.env.JWT_SECRET` containing the payload `{ userId: user._id }`.
2. **Client Storage:** `AuthContext` saves the token to `localStorage` and updates the React state.
3. **Outbound Requests:** `client/src/services/api.js` utilizes an `api.interceptors.request.use` function to read the token and inject `Authorization: Bearer <token>` into all headers.
4. **Verification:** Incoming requests to protected backend routes pass through `server/middleware/auth.js`. The token is extracted, verified via `jwt.verify()`, and the full User object is retrieved and attached to `req.user`.

---

## Database Models

### `User` Schema (`server/models/User.js`)
- **Fields:** 
  - `name` (String, required, min 2 chars)
  - `email` (String, required, unique, regex validated)
  - `password` (String, required, `select: false` to hide from default queries)
- **Indexes:** Explicit index on `email` to optimize login lookups.
- **Timestamps:** Auto-generates `createdAt` and `updatedAt`.

### `Post` Schema (`server/models/Post.js`)
- **Fields:** 
  - `title` (String, max 100)
  - `content` (String, min 10)
  - `category` (Enum: Tech, Lifestyle, Travel, Food)
  - `status` (Enum: draft, published)
  - `coverImage` (String URL, defaults to null)
- **Relationships:** `author` is an `ObjectId` referencing the `User` model.
- **Indexes:** 
  - Compound index: `{ author: 1, createdAt: -1 }` (Optimizes user dashboard).
  - Single index: `{ createdAt: -1 }` (Optimizes global feed).

---

## REST APIs

| Method | Route | Auth Required | Controller | Purpose |
|--------|-------|---------------|------------|---------|
| POST | `/api/auth/login` | No | `loginUser` | Authenticate and retrieve JWT |
| POST | `/api/users/register` | No | `registerUser` | Create new user account |
| POST | `/api/posts` | Yes | `createPost` | Create a new blog post |
| GET | `/api/posts?page=1&limit=5`| Yes | `getPosts` | Retrieve paginated list of posts |
| GET | `/api/posts/:id` | Yes | `getPostById` | Fetch a single post |
| PUT | `/api/posts/:id` | Yes | `updatePost` | Modify an existing post (Owner only) |
| DELETE | `/api/posts/:id` | Yes | `deletePost` | Remove a post (Owner only) |
| POST | `/api/upload` | Yes | Inline in `upload.js` | Upload image to Cloudinary |

---

## Middleware

- **`auth.js` (`protect`):** Extracts Bearer token, verifies signature, catches expired tokens, and blocks unauthorized access by returning a 401 status.
- **`errorHandler.js`:** Global error catcher. Must maintain the `(err, req, res, next)` signature. Standardizes all internal server crashes or manually thrown errors into a `{ success: false, message: ... }` JSON structure.
- **`upload.js`:** A `multer` instance configured with `memoryStorage()`. Enforces a 5MB size limit and strictly filters mimetypes to standard images (JPEG, PNG, WEBP, GIF).

---

## Socket.IO Implementation

- **Server Side (`server/server.js`):** 
  - Attaches `socket.io` to the native HTTP server.
  - Implements a custom middleware: `io.use((socket, next) => { ... })` that requires and verifies a JWT during the WebSocket handshake (`socket.handshake.auth.token`).
  - Passes the `io` instance down into the `postRoutes` so controllers can trigger global broadcasts.
- **Client Side (`client/src/App.jsx` implied):**
  - Connects using `socket.io-client`.
  - Listens for `socket.on('newPost')` and utilizes `react-hot-toast` to render non-intrusive UI alerts when other users publish content.

---

## File Upload Pipeline

1. **Browser:** User selects image. React builds `FormData` and POSTs to `/api/upload`.
2. **Express:** Receives request; triggers middleware.
3. **Multer:** Validates the file and holds it in server RAM (`req.file.buffer`).
4. **Cloudinary SDK:** `uploadToCloudinary` utility wraps `cloudinary.uploader.upload_stream` in a Promise, piping the RAM buffer directly to Cloudinary servers.
5. **MongoDB:** Cloudinary returns a permanent `secure_url`. The React app then sends this URL as the `coverImage` field in the subsequent POST to `/api/posts`.

---

## Error Handling

- **Async Handling:** All async controller functions are wrapped in `try/catch` blocks. If an error occurs, it is forwarded via `next(error)` to the global handler.
- **HTTP Responses:** The `createError(message, status)` helper allows controllers to throw errors with specific HTTP status codes attached (e.g., 404 Not Found, 403 Forbidden).

---

## Environment Variables

- `PORT`: Port for the Express server (e.g., 5000).
- `MONGO_URI`: The connection string for MongoDB (Atlas or local Docker).
- `JWT_SECRET`: A high-entropy string used to sign and verify JSON Web Tokens.
- `CLIENT_URL` / `FRONTEND_URL`: Used to configure CORS on the backend and allow Socket.IO connections.
- `VITE_API_URL`: Used by the Vite client to know where the backend resides.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials required by the Cloudinary SDK.

---

## Security

- **Passwords:** Plaintext passwords never touch the database. `bcrypt.hash()` handles hashing before saving, and `bcrypt.compare()` validates logins.
- **Tokens:** JWTs are stateless and tamper-proof. If modified on the client, `jwt.verify()` immediately rejects them.
- **Authorization Checks:** The `postController.js` enforces strict ownership logic:
  ```javascript
  if (post.author.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized', 403));
  }
  ```
