# StormCloudRun Milestone Tracker

This document tracks the major iterations and feature milestones for the StormCloudRun project on its path to version 1.0.

## v0.9.3: The Production-Ready Backend Update (Current)
-   **Summary:** Completes the transformation of StormCloudRun into a fully functional, production-ready application by implementing comprehensive backend API proxy logic. The backend now handles real Google Cloud and GitHub API calls, secure session management with Firestore, and streaming responses for deployment operations. This milestone represents the final major architectural piece before v1.0, making the application demo-ready with robust authentication and real data integration.
-   **Rationale:** This update fulfills the promise of the secure, server-side architecture established in v0.7.0 by actually implementing the "work" that the backend needs to do. Moving from mock responses to real API integration demonstrates the application's production viability while maintaining demo stability through strategic use of mock data for complex operations.
-   **Key Changes:**
    -   **Complete Backend API Implementation:** Added full API proxy logic in `backend/server.js` including Google Cloud Resource Manager integration for listing projects, GitHub API integration for repository access, and secure token management via Firestore.
    -   **Enhanced Authentication Flow:** Implemented complete OAuth 2.0 flows for both Google and GitHub with secure credential storage in Firestore, proper session management, and automatic user onboarding.
    -   **Real Data Integration:** The frontend now receives actual project lists from Google Cloud and repository lists from GitHub, replacing all mock data for read operations while maintaining mock responses for complex deployment streams to ensure demo reliability.
    -   **Streaming Operations:** Added realistic streaming responses for permission granting and deployment processes, providing live feedback during operations with proper error handling and status updates.
    -   **State Management Enhancement:** Updated `state/types.ts` and `state/reducer.ts` to handle richer authentication data including connection status, user profiles with pictures, and GitHub usernames for a more polished user experience.
    -   **Frontend-Backend Integration:** Enhanced `api.ts` with robust error handling, proper credential passing, and updated component calls to include required parameters like regions for service fetching.
    -   **Dependencies:** Added necessary backend dependencies (`@google-cloud/firestore`, `axios`) and ensured all API endpoints are properly authenticated and secured.

## v0.8.0: The Free Tier Update
-   **Summary:** Implements a major strategic shift from a user-provided API key to a free, backend-managed AI inference model. The AI assistant is now unlocked for free after a user authenticates with Google. This removes the friction of acquiring and managing an API key, making the AI feature accessible to all users. A mandatory privacy notice has been added to inform users about data usage for this free service.
-   **Rationale:** Removing the API key barrier significantly lowers the entry requirement for using the AI assistant, making it a core, accessible feature of the application rather than a premium add-on. This enhances the product's value and user experience.
-   **Key Changes:**
    -   **Authentication:** Removed all client-side `geminiApiKey` state and logic. The AI assistant is now enabled by the `googleLoggedIn` state.
    -   **API:** The `api.assistant.chat` function signature was changed to remove the `apiKey` parameter. It now calls a backend endpoint (`/api/assistant/chat`) that will manage authentication with the Code Assist API.
    -   **UI/UX:** The ChatWidget no longer prompts for an API key. It now prompts users to sign in with Google to enable the assistant.
    -   **Privacy:** A `privacy.md` file was created and a notice was added to the ChatWidget to comply with the terms of the free AI service.
    -   **Documentation:** All relevant documents (`modelcard.md`, `developer.md`, `todo.md`) were updated to reflect the new authentication model and backend requirements. The version number was incremented to `0.8.0`.

## v0.7.0: The Real McCoy Update
-   **Summary:** Implements the client-side portion of a full-stack architecture, enabling real user authentication via a server-side OAuth 2.0 flow. The mock API has been replaced with live `fetch` calls to a backend, and the application now performs a session check on startup to verify authentication status. The AI's knowledge base has been significantly enhanced with detailed documentation on OAuth 2.0 and Google Cloud Service Agents.
-   **Rationale:** This is a critical step towards a production-ready application. Moving to a real authentication flow enforces a secure architecture and allows for the development of a real backend that can perform authenticated API calls, as outlined in `developer.md`.
-   **Key Changes:**
    -   **Architecture:** Replaced all mock API calls in `api.ts` with real `fetch` calls designed to communicate with a backend server.
    -   **Authentication:** Implemented the client-side initiation of a server-side OAuth 2.0 flow. The frontend now redirects to backend endpoints for login.
    -   **Session Management:** Added a session verification step on application load to check the user's authentication status with the backend.
    -   **UX:** Added a loading screen during the initial session check for a smoother startup experience.
    -   **AI Knowledge Update:** `docs.ts` and `auth-methods.md` were significantly updated with provided context on OAuth 2.0 and Google Cloud Service Agents to make the AI assistant an expert on these topics.
    -   **Documentation:** Version numbers across the app and documentation were updated to `0.7.0`.

## v0.6.5: The Auth Clarity & Final Stability Update
-   **Summary:** Provides a definitive clarification on the application's authentication model, confirming the use of standard OAuth for users and the role of service accounts as workers. Fixes the root cause of the recurring `Uncaught SyntaxError` by re-engineering the context generation logic. Enhances the AI assistant's knowledge with detailed documentation on Secret Manager roles, Google Cloud authentication methods, and a primer on Google Cloud Service Agents.
-   **Rationale:** Permanently fixing the startup error is the top priority for application stability. Clarifying the authentication model and making the AI an expert on it empowers developers to build a secure, correct backend.
-   **Key Changes:**
    -   **Bug Fix:** Corrected the context generation logic to prevent `Uncaught SyntaxError` at startup.
    -   **AI Knowledge Update:** `docs.ts` was updated with documentation on Service Agents. The `secrets.md` and `auth-methods.md` files were expanded.
    -   **Code Cleanup:** The obsolete `components/Console.tsx` has been removed from the AI's self-awareness context.
    -   **Documentation:** Version numbers across the app and documentation were updated to `0.6.5`.
