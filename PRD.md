# Product Requirements Document (PRD)

## Project Overview

**Purpose:** 
The Creator's Platform is a full-stack web application designed to allow authenticated users to create, manage, and organize their blog posts within a centralized, modern interface.

**Target Users:**
Bloggers, writers, and content creators who need a simple, fast, and reliable platform to publish articles, share thoughts, and manage their content portfolios.

**Core Problem Solved:**
Provides a streamlined content management experience that eliminates the complexity of traditional CMS platforms, focusing solely on writing, managing ownership of content, and real-time community awareness.

**Project Goals:**
- Deliver a secure, authenticated environment for content creation.
- Ensure high performance through optimized database queries and pagination.
- Provide real-time engagement features (notifications) without page reloads.

**Business Value:**
Enables a scalable foundation for a community-driven blogging network, maintaining low operational costs via serverless/PaaS deployments and optimized asset delivery via Cloudinary.

---

## Features

The following features are currently implemented and functional within the system:

- **Authentication:** Secure email and password registration and login via JSON Web Tokens (JWT).
- **Session Persistence:** User sessions survive page refreshes via `localStorage` token management.
- **Post Management (CRUD):** 
  - Create posts with titles, categories, status (draft/published), and rich content.
  - Read posts via a paginated global feed.
  - Update and Delete existing posts.
- **File Uploads & Cloudinary Integration:** Image uploading for post cover images. Images are processed in-memory and streamed directly to Cloudinary CDN.
- **Real-time Notifications:** Socket.IO integration broadcasts a live "New Post" notification to all connected, authenticated clients whenever any user publishes a new article.
- **Paginated Feed:** Global post feed loads in chunks (5 per page by default) to optimize bandwidth and database load.

---

## User Roles

**Ownership-Based Authorization (No strict RBAC)**
The platform does not utilize a strict Role-Based Access Control (RBAC) system (e.g., no "Admin" or "Moderator" roles). 
Instead, it strictly enforces **Ownership-Based Authorization**:
- Any authenticated user can read all published posts.
- Any authenticated user can create a post.
- A user can **only** edit or delete a post if their JWT `userId` exactly matches the `author` ObjectId on the specific Post document in the database.

---

## Functional Requirements

1. **User Registration:** System must accept `name`, `email`, and `password`, validate uniqueness of the email, hash the password, and store the user.
2. **User Login:** System must verify credentials against hashed stored passwords and issue a signed JWT valid for 7 days.
3. **Protected Routes:** System must reject any API calls to `/api/posts` (write operations) or `/api/upload` if a valid Bearer JWT is not present in the headers.
4. **Post Creation:** System must accept text content and an optional image URL, attaching the current authenticated user's ID as the author.
5. **Image Upload:** System must accept `multipart/form-data` image uploads, restrict size to 5MB, and return a secure Cloudinary URL.
6. **Pagination:** System must accept `page` and `limit` queries on the GET posts endpoint and return total pages and current page metadata.
7. **Real-time Broadcast:** System must emit a `newPost` Socket.IO event to all connected clients upon successful post creation.

---

## Non-functional Requirements

- **Performance:** Database reads for the post feed must bypass Mongoose hydration (`.lean()`) for faster read speeds. The database must utilize indexes on `author` and `createdAt`.
- **Scalability:** The backend must remain stateless. All session state must be stored client-side (JWT) to allow backend horizontal scaling.
- **Security:** Passwords must be hashed using `bcrypt` (salt rounds: 10). APIs must be protected against unauthorized access.
- **Availability:** Application must be containerized via Docker for easy deployment and resilience across different hosting environments.
- **Reliability:** The system must handle file upload failures gracefully without crashing the Node process, utilizing centralized error handling.

---

## Tech Stack

- **Frontend:** React 18, React Router v6, Axios, React Hot Toast (Vite Build Tool)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (via Mongoose ORM)
- **Asset Storage:** Cloudinary
- **Real-time:** Socket.IO
- **Deployment:** Vercel (Frontend), Render (Backend), Docker Compose (Local Dev)

---

## Constraints

- **File Size Limit:** Image uploads are strictly capped at 5MB by the `multer` middleware.
- **File Types:** Only `image/jpeg`, `image/png`, `image/webp`, and `image/gif` are permitted.
- **Text-Only Posts:** If Cloudinary limits are reached, the system must support text-only posts (cover image defaults to null).
- **Socket Connections:** Real-time features require the client to successfully negotiate a WebSocket connection; corporate firewalls blocking WS may degrade the real-time notification experience.
