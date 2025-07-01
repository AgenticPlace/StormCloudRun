/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file contains a sample of Google Cloud Run documentation to be used as context for the AI assistant.
// In a real-world scenario, this could be fetched from a live source and updated periodically.

export const documentationContent = `
# Google Cloud Service Agents, OAuth 2.0, and Client Management

This document provides essential context on three core concepts for deploying applications: Service Agents (for permissions), OAuth 2.0 (for user authentication), and OAuth Client Management.

## Part 1: The OAuth 2.0 Authorization Framework

OAuth 2.0 is the industry-standard protocol for authorization. It enables applications like StormCloudRun to obtain limited access to a user's data on an HTTP service (like Google Cloud or GitHub) without exposing the user's password.

### Key Roles

*   **Resource Owner:** You, the user.
*   **Client:** The StormCloudRun application.
*   **Authorization Server:** Google's or GitHub's authentication server.
*   **Resource Server:** The Google Cloud or GitHub API servers that host your data (projects, repos, etc.).

### OAuth Flows

There are two primary flows:

1.  **Authorization Code Flow (for server-side apps):** This is the most secure method. The application's backend exchanges an authorization code for an access token. The token is never exposed to the user's browser. This is the recommended approach for production applications.

2.  **Implicit Grant Flow (for client-side apps):** This is a simplified flow where the access token is returned directly to the browser in the URL fragment. It's designed for apps that can't securely store a client secret. **StormCloudRun now uses this flow.**

---

## Part 2: Google Cloud Service Agents

### What is a Service Agent?
A service agent is a special, Google-managed service account. It acts as the identity of a Google Cloud service itself. When you enable an API (like Cloud Build), Google creates a service agent for it. This agent is then automatically granted a role in your project, allowing that service to perform actions.

### Why Are They Important for StormCloudRun?
When you ask StormCloudRun to deploy your code, it doesn't perform the build and deploy actions directly. Instead, it uses your authenticated credentials to instruct other Google services to do the work. These services need their own permissions to operate within your project.

-   **Example 1: Cloud Build needs to push to Artifact Registry.**
    When Cloud Build creates your container image, it needs permission to store that image in Artifact Registry. The **Cloud Build Service Agent** is what gets this permission.

-   **Example 2: Cloud Run needs to pull from Artifact Registry.**
    When your new service starts up, Cloud Run needs to pull the container image it's supposed to run. The **Cloud Run Service Agent** gets permission to do this.

---

## Part 3: OAuth Client Management

Your OAuth client is the credential which your application uses when making calls to Google OAuth 2.0 endpoint to receive an access token or ID token. After creating your OAuth client, you will receive a client ID and sometimes, a client secret.

Think of your client ID like your app's unique username when it needs to request an access token or ID token from Google's OAuth 2.0 endpoint. This ID helps Google identify your app and ensure that only authorized applications can access user data.

### Client ID and Client Secret
Similar to how you would use a username and password to log to online services, many applications use a client ID paired with a client secret. The client secret adds an extra layer of security, acting like your app's password.

Applications are categorized as either public or private clients:

* **Private Clients:** These apps, like web server applications, can securely store the client secret because they run on servers you control.
* **Public Clients:** Native apps or JavaScript-based apps fall under this category. They cannot securely store secrets, as they reside on user devices and as such do not use client secrets. 

### Best Practices for Client Secret Management

* Never add client secrets directly in your code or check them into version control systems such as Git or Subversion. 
* Store client secrets securely using a dedicated secret management service like Google Cloud Secret Manager if you are using a server-side flow.
* Rotate client secrets periodically and change immediately in the case of a leak.
`;