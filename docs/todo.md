# StormCloud: Development TODO List

This checklist tracks the work for the full-stack StormCloud application.

## Phase 1: Backend Setup & Authentication (Complete)

-   [x] **Initialize Backend Project**
-   [x] **Configure Google Cloud OAuth 2.0**
-   [x] **Configure GitHub OAuth App**
-   [x] **Implement Authentication Flow in Backend**
    -   [x] Set up secure, cookie-based session management.
    -   [x] Create `/api/auth/google` and `/api/auth/google/callback` endpoints.
    -   [x] Create `/api/auth/me` endpoint for the frontend to check session status.
    -   [x] Create `/api/auth/logout` endpoint.
-   [x] **CRITICAL: Migrate to Google Secret Manager**
    -   [x] The backend is built to fetch its configuration from Secret Manager.

## Phase 2: Backend API Proxy Endpoints (In Progress)

This phase is about making the backend functional. The endpoints are now implemented but return *mock data*. The next step is to replace the mock data with real API calls using the user's session credentials.

-   [ ] **Google Cloud Endpoints**
    -   [x] `/api/google/projects`: Lists projects (currently mock).
    -   [x] `/api/google/services`: Lists Cloud Run services (currently mock).
    -   [x] `/api/google/permissions`: Handles enabling APIs and granting IAM roles (currently mock stream).
    -   [x] `/api/google/deploy`: Triggers a Cloud Build job (currently mock stream).
        -   [x] **Process advanced configurations (env vars, secrets, scaling) via request body.**
        -   [x] **Implement logic for different build strategies (buildpacks vs. dockerfile) in mock.**
        -   [x] **Simulate CI trigger creation.**
    -   [ ] `/api/google/deploy/status/:buildId`: Endpoint for polling deployment logs (Not implemented, using streaming instead).

-   [ ] **GitHub Endpoints**
    -   [x] `/api/github/repos`: Lists user's repositories (currently mock).
    -   [ ] **Implement real GitHub OAuth Flow**.

-   [ ] **AI Assistant Endpoint**
    -   [x] `/api/assistant/chat`: Proxies calls (currently mock response).

-   [ ] **Agentic Endpoints**
    -   [ ] `/api/agent/apply-fix`: Receive a `suggestedFix`, check out the repo, apply the change, commit, push, and re-trigger deployment.

## Phase 3: Frontend Integration (Complete)

-   [x] **Update `api.ts`**
    -   [x] Set `useMockApi` to `false`.
    -   [x] `api.auth.login` now redirects the browser to `/api/auth/google`.
    -   [x] `api.auth.logout` calls the backend logout endpoint.
    -   [x] `api.auth.checkStatus` calls the backend `/api/auth/me` endpoint.
    -   [x] All data fetching (`getProjects`, `getRepos`, `getCloudRunServices`) now calls the backend.
    -   [x] `deploy` and `grantPermissions` now make streaming calls to the backend.

-   [x] **Connect Real Data to Components**
    -   [x] In `index.tsx`, verify that the login flow works via session checking.
    -   [x] In `components/Step1Connect.tsx`, ensure project/repo dropdowns are populated from the backend.
    -   [x] In `components/Step2Configure.tsx`, ensure the "existing services" dropdown is populated correctly.
    -   [x] Implemented streaming for deployment logs in `index.tsx`.
    -   [x] Ensured user-friendly notifications are displayed for any backend errors.

## Phase 4: Production & Polish

-   [ ] **Containerize Backend**
    -   [ ] Create a `Dockerfile` for the backend service.
-   [ ] **Implement Structured Logging**
    -   [ ] Add a library like Winston to the backend for JSON-formatted logs.
-   [ ] **Set up CI/CD**
    -   [ ] Create a GitHub Actions workflow to auto-deploy the backend to Cloud Run.
-   [ ] **Harden Autonomous Mode**
-   [ ] **CORS Configuration**
    -   [x] CORS is implemented, but review for production hardening.