# AI Engineer Student Task Tracker

A production-minded, full-stack web application designed for AI mentors and instructors to manage, publish, and track daily practical tasks assigned to students traversing the AI Engineer roadmap.

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
- **Admin (Mentor)**:
  - Create, edit, deactivate, and manage student accounts.
  - Reset student passwords securely (never displays or transmits old passwords).
  - Author and publish sequential dynamic tasks daily (with draft support).
  - Review queue for inspecting submissions, proof screenshots, and GitHub code.
  - Approve submissions, request revisions, or reject with mandatory feedback.
  - Comprehensive analytics on active students, submissions in review, and students falling behind.
  - Complete administrative audit trail.
- **Student**:
  - Personalized dashboard displaying assigned tasks, progress bar, and locked roadmap items.
  - Mandatory initial password change on first login.
  - Practical checklist verification.
  - Secure proof screenshot uploads stored privately in MongoDB GridFS.
  - Submissions versioning (revision history preserved across all corrections).
  - Inspection of mentor review decisions and feedback.

### 2. Task Progression & Approval Engine
- **Sequential Roadmapping**: Newly created students start at **Task 0** with 0 assigned tasks.
- **Dynamic Task Numbering**: Each task automatically receives an auto-incremented sequential ID (Task 1, Task 2, etc.).
- **Atomic Progression Unlocking**:
  - When Task 1 is published, eligible active students receive Task 1.
  - Publishing a task and unlocking it are separate operations.
  - Students cannot skip ahead. Task $N+1$ unlocks **only** when Task $N$ is reviewed and **Approved** by the mentor.
  - If mentor requests corrections (`changes_requested`), the current task remains incomplete and next tasks remain locked.
  - Students resubmit corrected work as Version 2, 3, etc., preserving all previous versions and review notes.
- **Approved Progress Calculation**:
  $$\text{Completion \%} = \frac{\text{Approved Tasks}}{\text{Assigned Tasks}} \times 100$$
  Unreviewed submissions are never counted as completed work until verified.

### 3. Private Proof Storage via MongoDB GridFS
- Images are **not** stored as base64 in JSON documents or stored publicly.
- Uploaded image buffers are validated against maximum file size (3MB), valid image MIME types, and binary magic bytes (JPEG, PNG, WebP).
- Stored privately in MongoDB GridFS with randomized identifiers.
- Streaming retrieval endpoint (`/api/v1/files/:fileId`) enforces strict authorization:
  - Admins can inspect any submission proof.
  - Students can **only** stream proof images associated with their own submissions.

---

## 🛠 Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide React icons.
- **Backend**: Node.js, Express.js (ES Modules), Mongoose, MongoDB GridFS, JWT, bcryptjs, Multer.
- **Deployment Ready**: Prepared for separate Vercel deployments (serverless backend via `@vercel/node` and SPA frontend).

---

## 🏁 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Docker container on port 27017)

### 1. MongoDB Setup
You can run MongoDB 7 using Docker:
```bash
docker run -d --name tasktracker-mongo -p 27017:27017 mongo:7.0
```

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment (a pre-configured .env is provided for local development)
cp .env.example .env

# Initialize database with seed data (Admin, Sample Tasks, Students)
npm run seed

# Run automated test suite
npm test

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Pre-Seeded Demo Credentials

The database seeder (`npm run seed`) populates the system with the following accounts:

| Role | Register No | Password | Description |
|---|---|---|---|
| **Mentor (Admin)** | `ADMIN001` | `AdminPassword123!` | Lead instructor with full management access |
| **Student 1** | `AI2026001` | `StudentPassword123!` | Rohan Sharma (Task 1 approved, Task 2 assigned) |
| **Student 2** | `AI2026002` | `StudentPassword123!` | Ananya Verma (Task 1 submitted, pending review) |
| **Student 3** | `AI2026003` | `StudentPassword123!` | Kabir Patel (New student, prompts password change) |

---

## ☁️ Vercel Deployment Instructions

The application is structured to deploy the Frontend and Backend as separate projects on Vercel.

### 1. Backend Deployment (Vercel Serverless)
1. In Vercel, import the repository and set the **Root Directory** to `backend`.
2. Framework Preset: **Other**.
3. Set the Environment Variables in the Vercel Dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.xxx.mongodb.net/tasktracker?retryWrites=true&w=majority`).
   - `JWT_SECRET`: A secure random secret key.
   - `JWT_EXPIRES_IN`: `7d`.
   - `FRONTEND_URL`: URL of your deployed frontend (e.g. `https://tasktracker-frontend.vercel.app`).
   - `NODE_ENV`: `production`.
   - `MAX_UPLOAD_SIZE_MB`: `3`.
4. Deploy. The backend entry point is configured via `backend/vercel.json` and `backend/api/index.js`.

### 2. Frontend Deployment
1. In Vercel, import the repository and set the **Root Directory** to `frontend`.
2. Framework Preset: **Vite**.
3. Set the Environment Variable:
   - `VITE_API_URL`: Your deployed backend API URL (e.g. `https://tasktracker-backend.vercel.app/api/v1`).
4. Deploy. SPA routing rewrites are handled by `frontend/vercel.json`.

---

## 📚 REST API Reference (`/api/v1`)

### Authentication
- `POST /auth/login` - Authenticate using registerNumber & password (rate-limited).
- `POST /auth/change-password` - Update password (authenticated).
- `GET /auth/me` - Get profile and student progression statistics.
- `POST /auth/logout` - Clear user session.

### Students (Admin Only)
- `GET /students` - List students with pagination, search, and progress metrics.
- `POST /students` - Register a new student account (starts at Task 0).
- `GET /students/:id` - Full student profile, all tasks, submissions, and reviews.
- `PUT /students/:id` - Update student profile (name, githubRepoUrl, status).
- `POST /students/:id/reset-password` - Reset password (forces change on login).
- `PATCH /students/:id/toggle-status` - Deactivate / activate student account.

### Daily Tasks
- `GET /tasks` - List tasks (admins see all; students see published only).
- `GET /tasks/:id` - Get specific task details and stats.
- `POST /tasks` - Create task with sequential number (Admin only).
- `PUT /tasks/:id` - Update task (protected against destructive edits if submitted).
- `POST /tasks/:id/publish` - Publish task and assign to eligible students (Admin only).
- `GET /tasks/:id/eligible-students` - Preview students eligible for this task.

### Student Tasks & Submissions
- `GET /student-tasks` - Get current student's roadmap (assigned + locked tasks).
- `PATCH /student-tasks/:id/toggle-checkbox` - Toggle completion checklist.
- `POST /submissions` - Submit proof image (multipart/form-data), GitHub URL, and explanation.
- `GET /submissions/student-task/:studentTaskId` - Get submission version history.

### Reviews (Admin Only)
- `GET /reviews/pending` - Pending review queue FIFO.
- `POST /reviews/:submissionId/approve` - Approve work & unlock next roadmap task.
- `POST /reviews/:submissionId/request-changes` - Request corrections with feedback.
- `POST /reviews/:submissionId/reject` - Reject submission with feedback.

### Storage & Analytics
- `GET /files/:fileId` - Authenticated private streaming of proof image from GridFS.
- `GET /analytics/overview` - Admin metrics, overdue stats, and falling-behind alerts.
- `GET /audit-logs` - System audit log trail.
- `GET /health` - API health check.

