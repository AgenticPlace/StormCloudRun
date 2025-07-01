# Authentication Methods in StormCloudRun

This document outlines the authentication methods used by the StormCloudRun application to securely interact with Google Cloud and GitHub APIs on behalf of the user.

## The Core Principle: Server-Side OAuth 2.0

For security reasons, a client-side application (like our React frontend) **must never** handle or store sensitive credentials like OAuth tokens or API keys. All authentication is managed by a dedicated **backend server**. The frontend's role is simply to initiate the authentication process and then operate using a secure session cookie provided by the backend.

We use the **OAuth 2.0 Authorization Code Grant Flow**, which is the industry standard for server-side applications.

### The Flow Explained

Here is a step-by-step breakdown of how a user logs into StormCloudRun:

1.  **User Action:** The user clicks the "Sign in with Google" button in the frontend application.

2.  **Frontend Redirect:** The React app doesn't call Google directly. Instead, it redirects the user's browser to our own backend endpoint, for example: `https://stormcloud.run/api/auth/google`.

3.  **Backend Initiates OAuth:** The backend server receives this request. It then constructs the proper Google OAuth 2.0 consent screen URL, including our application's `client_id`, the required `scopes` (like `cloud-platform` and `project.readonly`), and a `redirect_uri` that points back to our backend (`https://stormcloud.run/api/auth/google/callback`). The backend then redirects the user's browser to this Google URL.

4.  **User Consent:** The user is now on a secure Google domain. They see a standard consent screen asking for permission for "StormCloudRun" to access their Google Cloud data. The user authenticates (if they aren't already) and clicks "Allow".

5.  **Google Redirects with Code:** Google redirects the user's browser back to the `redirect_uri` we specified in step 3. This request from Google includes a temporary, one-time-use **authorization code** as a query parameter (e.g., `?code=4/0Ab...`).

6.  **Backend Exchanges Code for Tokens:** Our backend's callback endpoint (`/api/auth/google/callback`) receives this request. It securely, on the server-side, makes a `POST` request to Google's token endpoint. This request includes the `authorization_code`, our `client_id`, and our **`client_secret`**.

7.  **Tokens Received:** Google verifies the code and credentials and, if valid, returns an `access_token` and a `refresh_token` to our backend. The `access_token` is used to make API calls, and the `refresh_token` is used to get a new access token when the old one expires.

8.  **Session Creation:** The backend securely encrypts and stores these tokens (ideally in a database, linked to a user record). It then creates a session for the user and sends a secure, `HttpOnly` session cookie back to the user's browser.

9.  **Authenticated State:** The browser now has a session cookie. The frontend application reloads, and its initial "check session" call to the backend (`/api/me`) now succeeds. The backend identifies the user via their session cookie, and the frontend can now display their logged-in state (e.g., "Logged in as user@example.com").

All subsequent requests from the frontend to the backend (e.g., "list my projects") are authenticated using this session cookie. The backend receives the request, loads the user's tokens from storage, and uses those tokens to make the actual authenticated API call to Google Cloud.

This flow ensures that sensitive tokens are never exposed to the browser, providing a secure and robust authentication system. The process for GitHub is identical.
