# AI-Powered SaaS: Intelligent Workspace & Productivity Suite

An advanced, premium-tier AI-powered SaaS productivity platform combining **Task Management**, a customizable **Pomodoro Timer**, and an **AI Copilot** powered by Google Gemini (`gemini-2.5-flash`). Built with a modern TypeScript/MERN-style stack (MongoDB, Express, React, Node.js).

---

## 🚀 Key Features

*   **📊 Interactive Analytics Dashboard**
    *   Visual summary of task completion statistics, priority distribution, and upcoming deadlines.
    *   Activity logs tracking productivity metrics and session accomplishments.
*   **📋 Advanced Task Management**
    *   Full CRUD operations with custom statuses (To Do, In Progress, Review, Completed), priorities (Low, Medium, High), categories, and due dates.
    *   Dynamic filtering and search capabilities.
*   **⏱️ Integrated Pomodoro Timer**
    *   Fully functional, highly customizable productivity timer (Focus, Short Break, Long Break).
    *   Direct integration with your tasks, allowing you to track focus sessions against specific items.
*   **🤖 Gemini AI Assistant / Copilot**
    *   An interactive chat interface powered by `gemini-2.5-flash`.
    *   Assists in breaking down complex tasks into subtasks, prioritizing workflows, and brainstorming.
*   **🔒 Enterprise-Grade Security**
    *   Robust user authentication with secure password hashing (`bcryptjs`) and stateless session management (`jsonwebtoken` with cookies).
    *   Express-rate-limit protection to prevent brute force attacks, along with `helmet` security headers.

---

## 🛠️ Technology Stack

### Frontend
*   **Core Framework:** React 19 + TypeScript + Vite
*   **State Management:** Zustand (lightweight, reactive global state) & React Query (server cache syncing)
*   **Routing:** React Router v7
*   **Styling & UI:** Tailwind CSS, PostCSS, Lucide Icons, React Hot Toast
*   **Parser:** React Markdown (for rich format rendering of AI responses)

### Backend
*   **Runtime:** Node.js + TypeScript
*   **Framework:** Express.js
*   **Database ORM:** Mongoose (MongoDB)
*   **AI Integration:** Google Generative AI SDK (`@google/generative-ai`)
*   **Validation:** Zod schemas
*   **Security:** Helmet, CORS, Cookie-parser, Express Rate Limit, BcryptJS

---

## 📂 Project Structure

```text
AI-powered-SaaS/
├── backend/                  # Express REST API with TypeScript
│   ├── src/
│   │   ├── config/           # Database and env configs
│   │   ├── controllers/      # Request handlers (auth, tasks, AI chat)
│   │   ├── middleware/       # Authentication guards, error handlers
│   │   ├── models/           # Mongoose schemas (User, Task)
│   │   ├── routes/           # REST endpoints
│   │   ├── types/            # TypeScript declarations
│   │   ├── app.ts            # Express app configuration
│   │   └── server.ts         # Main entry point
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                 # React Application (Vite + Tailwind)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # CSS & images
│   │   ├── components/       # Reusable layout and UI components
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Client utilities & Axios instance
│   │   ├── pages/            # Application views (Dashboard, Tasks, Pomodoro, AI Assistant)
│   │   ├── store/            # Zustand global stores (auth, theme)
│   │   ├── types/            # Type definitions
│   │   ├── App.tsx           # Route mapping & layout
│   │   └── main.tsx          # React render root
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md                 # Project documentation (this file)
```

---

## ⚙️ Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   [MongoDB](https://www.mongodb.com/) (Local instance or Atlas connection string)
*   [Gemini API Key](https://aistudio.google.com/) (For AI Copilot functionality)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/intelligent-workspace
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your_gemini_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The server will start running at `http://localhost:5000` with the health check endpoint accessible at `http://localhost:5000/api/health`.*

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The development server will launch at `http://localhost:5173`.*

---

## 🧪 Running Tests & Quality Check

To build and compile both parts of the system, you can run the build scripts:

*   **Backend Build:** `npm run build` inside `backend/` (compiles TS to JS in `/dist`).
*   **Frontend Build:** `npm run build` inside `frontend/` (compiles and bundles via Vite to `/dist`).
*   **Frontend Linter:** `npm run lint` to execute ESLint validation.
