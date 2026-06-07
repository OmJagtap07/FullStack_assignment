# Creator's Platform

A full-stack MERN application that enables authenticated users to create, manage, and organize their blog posts with a clean, modern interface.

## Deployment Links

- **Frontend (Live Application):** [https://creators-platform-client.vercel.app/](https://creators-platform-client.vercel.app/)
- **Backend (API Base URL):** [https://creator-platform-api-dgyf.onrender.com](https://creator-platform-api-dgyf.onrender.com)

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios, React Toastify |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Build Tool | Vite |

## Features

- **User Registration & Login** — Secure JWT-based authentication
- **Persistent Sessions** — Token stored in localStorage; login survives page refresh
- **Protected Routes** — Frontend guards + backend middleware enforce access control
- **Full CRUD** — Create, Read, Update, and Delete blog posts
- **Pagination** — Posts loaded in pages (5 per page) using limit/skip
- **Ownership Checks** — Users can only edit/delete their own posts (enforced backend-side)
- **Error Handling** — Centralized Express error middleware + React toast notifications
- **Authorization** — 403 Forbidden responses for unauthorized actions

## Project Structure

```
creators-platform/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── pages/          # Page-level components
│   │   └── services/       # Axios API utility with interceptors
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # MongoDB connection
│   ├── controllers/        # Route logic (auth, users, posts)
│   ├── middleware/         # JWT auth + global error handler
│   ├── models/             # Mongoose schemas (User, Post)
│   ├── routes/             # Express routers
│   └── server.js           # Entry point
├── .gitignore
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/OmJagtap07/FullStack_assignment.git
cd creators-platform
```

### 2. Configure the server environment

Create `server/.env` and fill in your values:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Configure the client environment (optional)

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 4. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 5. Run the application

```bash
# In /server
npm run dev

# In /client (separate terminal)
npm run dev
```

The client runs on **http://localhost:5173** and the server on **http://localhost:5000**.

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CLIENT_URL` | Frontend URL for CORS (e.g. http://localhost:5173) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (default: http://localhost:5000) |

> ⚠️ Never commit `.env` files. They are excluded via `.gitignore`.

## Complete User Flow

```
Register → Login → Dashboard → Create Post
        → View Paginated Posts → Edit Post
        → Delete Post → Logout
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login + receive JWT |
| GET | `/api/posts?page=1&limit=5` | Yes | Paginated posts |
| POST | `/api/posts` | Yes | Create post |
| GET | `/api/posts/:id` | Yes | Get single post |
| PUT | `/api/posts/:id` | Yes | Update post (owner only) |
| DELETE | `/api/posts/:id` | Yes | Delete post (owner only) |

## Error Handling

- **Backend**: Centralized 4-parameter Express error middleware returns `{ success: false, message }` with correct HTTP status codes (400, 401, 403, 404, 500)
- **Frontend**: All API calls wrapped in `try/catch`; errors displayed as toast notifications via `react-toastify`
