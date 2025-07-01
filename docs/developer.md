
# StormCloudRun Developer Guide: From Simulation to Production

## 0. Project Vision

Before diving into the technical details, please read `intro.md`. It outlines the mission and vision for StormCloudRun: to create an elegant, powerful, and agnostic deployment tool that simplifies the developer experience for shipping code to Google Cloud Run.

## 1. Core Architecture

A browser-based frontend application (like our React app) **cannot securely store credentials or make authenticated API calls directly to Google Cloud or GitHub services**. Doing so would expose sensitive information (like API keys or OAuth tokens) to the user's browser, creating a major security vulnerability.

Therefore, we have adopted a **full-stack architecture** with a dedicated backend service that acts as a secure intermediary between the frontend and the cloud provider APIs.

```
+----------------+      (1) API Requests      +-----------------+      (3) Google Cloud API Calls
|                |      (e.g., get projects)  |                 |      (e.g., list Cloud Run services)
| React Frontend | <----------------------> |   Backend API   | ----------------------------------> [ Google Cloud APIs ]
| (StormCloudRun)  |                          | (Node.js/Express)  |
|                |      (2) Data / Status     |                 |      (4) GitHub API Calls
+----------------+                            +-----------------+ ----------------------------------> [ GitHub API ]
       ^   ^                                          |              |
       |   | (OAuth 2.0 Flow)                         |              +----(5) AI API Calls---> [ Google Code Assist API ]
       |   |                                          | (Securely stores tokens
       |   +------------------------------------------+  and secrets)
       |
    [ Google Authentication ]
       ^
       |
       +------------------------------------------------------------------+
                                                                          |
                                                                    [ GitHub Authentication ]
```

### Components:

1.  **React Frontend:** The user interface, built with React, TypeScript, and a `useReducer` hook for state management.
    *   **Responsibilities:** It renders the UI and makes API calls to our *own* backend service. All calls are routed through the `api.ts` module, which points to the backend server. The frontend initiates the login flow by redirecting the user to the backend.

2.  **Backend API (Node.js/Express):** The secure intermediary. The complete code is available in `backend/server.js`.
    *   **Responsibilities:**
        *   **Authentication:** Handles the server-side OAuth 2.0 Authorization Code Flow for Google. See `auth-methods.md` for a detailed explanation. (GitHub auth is a TODO).
        *   **API Proxy:** Exposes its own set of API endpoints for the frontend (e.g., `/api/google/projects`, `/api/github/repos`). It uses the user's session to make authenticated calls.
        *   **AI Chat Proxy:** Exposes an endpoint (`/api/assistant/chat`) that takes the user's chat history and makes an authenticated call to the **Google Code Assist API**.
        *   **Deployment Logic:** Initiates the deployment process (e.g., triggers a Cloud Build job) and provides real-time status updates back to the frontend via a streaming response.
        *   **Secure Secret Management:** **CRITICAL:** The backend is responsible for securely managing all secrets (OAuth Client IDs/Secrets, API keys). It fetches these from **Google Secret Manager**, not from `.env` files in production.

## 2. Running the Full-Stack Application

To run the application, you must start both the backend and the frontend.

1.  **Start the Backend:**
    *   Navigate to the `backend/` directory.
    *   Run `npm install` to install dependencies.
    *   Create a `.env` file from the `.env.example` template and fill in your credentials.
    *   **IMPORTANT:** Make sure the `FRONTEND_URL` variable in your `.env` file matches the exact URL (including the port) of your running frontend. An incorrect URL is the most common cause of CORS "Failed to fetch" errors.
    *   Run `npm start`. The server will start, typically on port 8080.

2.  **Start the Frontend:**
    *   Navigate to the root project directory.
    *   Run `npm install` (if you haven't already).
    *   Run `npm start` (or your equivalent command). The React app will start, typically on a port like 3000 or 5173.

The frontend (`api.ts`) is configured to send requests to the backend server. When you click "Connect to Google" in the UI, you will be redirected to the backend, which will then handle the entire secure authentication flow.

## 3. Autonomous Mode & RAGE Loop

*   When a deployment is initiated with `isAutonomousMode: true`, the backend must handle the potential for an iterative feedback loop. 
*   If the initial deployment fails, the frontend will automatically send the failure logs back to the AI. The AI will respond with a structured JSON object containing a `suggestedFix`.
*   The frontend will display this fix. If the user approves, it will call a new endpoint, e.g., `POST /api/agent/apply-fix`.
*   This backend endpoint must be able to **programmatically modify the source code** before re-triggering the deployment. This would involve:
    1.  Cloning the user's GitHub repository to a temporary location.
    2.  Applying the file modification from the `suggestedFix` payload.
    3.  Committing and pushing the change.
    4.  Triggering a new deployment.

## 4. Structured Logging

The frontend features an enterprise-grade console that expects structured logs. The backend should use a library like **Winston** (for Node.js) to produce JSON-formatted logs that match the `LogEntry` type defined in `src/state/types.ts`. The current implementation streams NDJSON (newline-delimited JSON) for real-time updates.
