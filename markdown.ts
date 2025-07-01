/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file consolidates all markdown documentation into the JS bundle
// to prevent issues with serving static .md files in production.

export const intro = `# StormCloudRun: A Vision for Effortless Deployment

## What is StormCloudRun?

StormCloudRun is a premier, one-click deployment tool designed to bridge the gap between a developer's source code on GitHub and a running service on Google Cloud Run. It is built to be powerful, elegant, and agnostic, serving as a flagship example of how modern web technologies can create a seamless and intelligent developer experience.

## The Mission

The core mission of StormCloudRun is **demystification**. Deploying applications, especially in a serverless environment, can involve a complex web of permissions, APIs, and configurations. StormCloudRun abstracts this complexity away behind a clean, guided, and interactive wizard.

Our goal is to empower developers to:
-   **Deploy with Confidence:** Understand each step of the process through a self-explanatory UI.
-   **Move Faster:** Go from a \`git push\` to a live URL in minutes, not hours.
-   **Learn by Doing:** Gain an intuitive understanding of the deployment pipeline through a hands-on, secure tool.
-   **Debug Intelligently:** Leverage a built-in AI assistant that can analyze deployment logs and even propose and apply fixes autonomously, turning errors into learning opportunities.

## A Gift to the Community

StormCloudRun is being developed as a gift to the Google Cloud and open-source communities. It is intended to be a reusable, agnostic tool that any developer or organization can use to simplify their deployment workflows. It is licensed under the Apache 2.0 license to encourage broad adoption and contribution.

This project is not just a utility; it's a statement about the future of developer tools—a future that is intelligent, user-centric, and open.

-- _MINDX Augmentic Intelligence_`;

export const developer = `# StormCloudRun Developer Guide: From Simulation to Production

## 0. Project Vision

Before diving into the technical details, please read \`docs/intro.md\`. It outlines the mission and vision for StormCloudRun: to create an elegant, powerful, and agnostic deployment tool that simplifies the developer experience for shipping code to Google Cloud Run.

## 1. Core Architecture

A browser-based frontend application (like our React app) **cannot securely store credentials or make authenticated API calls directly to Google Cloud or GitHub services**. Doing so would expose sensitive information (like API keys or OAuth tokens) to the user's browser, creating a major security vulnerability.

Therefore, we have adopted a **full-stack architecture** with a dedicated backend service that acts as a secure intermediary between the frontend and the cloud provider APIs.

\`\`\`
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
\`\`\`

### Components:

1.  **React Frontend:** The user interface, built with React, TypeScript, and a \`useReducer\` hook for state management.
    *   **Responsibilities:** It renders the UI and makes API calls to our *own* backend service. All calls are routed through the \`api.ts\` module, which points to the backend server. The frontend initiates the login flow by redirecting the user to the backend.

2.  **Backend API (Node.js/Express):** The secure intermediary. The complete code is available in \`backend/server.js\`.
    *   **Responsibilities:**
        *   **Authentication:** Handles the server-side OAuth 2.0 Authorization Code Flow for Google. See \`docs/auth-methods.md\` for a detailed explanation. (GitHub auth is a TODO).
        *   **API Proxy:** Exposes its own set of API endpoints for the frontend (e.g., \`/api/google/projects\`, \`/api/github/repos\`). It uses the user's session to make authenticated calls.
        *   **AI Chat Proxy:** Exposes an endpoint (\`/api/assistant/chat\`) that takes the user's chat history and makes an authenticated call to the **Google Code Assist API**.
        *   **Deployment Logic:** Initiates the deployment process (e.g., triggers a Cloud Build job) and provides real-time status updates back to the frontend via a streaming response.
        *   **Secure Secret Management:** **CRITICAL:** The backend is responsible for securely managing all secrets (OAuth Client IDs/Secrets, API keys). It fetches these from **Google Secret Manager**, not from \`.env\` files in production.

## 2. Running the Full-Stack Application

To run the application, you must start both the backend and the frontend.

1.  **Start the Backend:**
    *   Navigate to the \`backend/\` directory.
    *   Run \`npm install\` to install dependencies.
    *   Create a \`.env\` file from the \`.env.example\` template and fill in your credentials.
    *   **IMPORTANT:** Make sure the \`FRONTEND_URL\` variable in your \`.env\` file matches the exact URL (including the port) of your running frontend. An incorrect URL is the most common cause of CORS "Failed to fetch" errors.
    *   Run \`npm start\`. The server will start, typically on port 8080.

2.  **Start the Frontend:**
    *   Navigate to the root project directory.
    *   Run \`npm install\` (if you haven't already).
    *   Run \`npm start\` (or your equivalent command). The React app will start, typically on a port like 3000 or 5173.

The frontend (\`api.ts\`) is configured to send requests to the backend server. When you click "Connect to Google" in the UI, you will be redirected to the backend, which will then handle the entire secure authentication flow.

## 3. Autonomous Mode & RAGE Loop

*   When a deployment is initiated with \`isAutonomousMode: true\`, the backend must handle the potential for an iterative feedback loop. 
*   If the initial deployment fails, the frontend will automatically send the failure logs back to the AI. The AI will respond with a structured JSON object containing a \`suggestedFix\`.
*   The frontend will display this fix. If the user approves, it will call a new endpoint, e.g., \`POST /api/agent/apply-fix\`.
*   This backend endpoint must be able to **programmatically modify the source code** before re-triggering the deployment. This would involve:
    1.  Cloning the user's GitHub repository to a temporary location.
    2.  Applying the file modification from the \`suggestedFix\` payload.
    3.  Committing and pushing the change.
    4.  Triggering a new deployment.

## 4. Structured Logging

The frontend features an enterprise-grade console that expects structured logs. The backend should use a library like **Winston** (for Node.js) to produce JSON-formatted logs that match the \`LogEntry\` type defined in \`src/state/types.ts\`. The current implementation streams NDJSON (newline-delimited JSON) for real-time updates.`;

export const features = `# StormCloudRun: Key Features

StormCloudRun is more than just a deployment tool; it's an intelligent, developer-centric platform designed to make shipping code to Google Cloud Run a seamless and powerful experience.

### 1. Guided Deployment Wizard
The core of the application is a clean, step-by-step wizard that guides you through the entire deployment process. From connecting your accounts to configuring your service, each step is designed to be clear, intuitive, and focused, eliminating guesswork and reducing the cognitive load of a complex deployment.

### 2. Intelligent & Flexible Configuration
-   **Build Strategy:** Choose between Google Cloud's automatic **Buildpacks** for a zero-config experience (recommended) or specify the path to a custom **\`Dockerfile\`** for complete control over your container image.
-   **Environment Variables:** Easily add, edit, and remove key-value pairs for runtime configuration.
-   **Secret Management:** Securely mount secrets from Google Secret Manager as environment variables in your service, following security best practices.
-   **Instance Scaling:** Configure the minimum and maximum number of instances for your service to fine-tune performance and manage costs.

### 3. Integrated AI Assistant
An AI assistant, powered by the Gemini model, is built directly into the application.
-   **Documentation on Demand:** Ask any question about Google Cloud Run, and the assistant will provide concise, accurate answers based on its extensive knowledge base.
-   **Eliminate Context Switching:** Get the information you need without ever leaving the deployment workflow.

### 4. Autonomous Self-Correction (RAGE Loop)
This is StormCloudRun's most powerful feature. When "Autonomous Mode" is enabled:
-   **Automatic Log Analysis:** If a deployment fails, the AI assistant automatically analyzes the deployment logs to identify the root cause of the error.
-   **Actionable Code Fixes:** The assistant doesn't just give advice; it generates a structured code fix (e.g., adding a missing dependency to \`requirements.txt\`).
-   **One-Click Retry:** With a single click, you can apply the suggested fix and retry the deployment, turning a frustrating failure into a learning opportunity and a successful deployment.

### 5. One-Click Continuous Deployment (CI/CD)
With a single toggle switch, you can enable Continuous Deployment. When activated, StormCloudRun will automatically configure a Cloud Build trigger that watches your GitHub repository. Any new commit pushed to your main branch will automatically be built and deployed, creating a full CI/CD pipeline instantly.

### 6. Live, Structured Deployment Console
Monitor your deployment in real-time with a professional-grade console.
-   **Live Log Streaming:** Watch the build and deployment process unfold with a live stream of logs directly from the backend.
-   **Structured & Color-Coded:** Logs are structured and color-coded by severity (Info, Success, Warning, Error) for easy scanning and debugging.

### 7. Secure by Design
The entire application is architected with security as a top priority. The frontend UI never handles sensitive credentials. All authentication and API calls to cloud providers are managed by a secure backend service, ensuring your tokens and keys remain protected.`;

export const milestone = `# StormCloudRun Milestone Tracker

This document tracks the major iterations and feature milestones for the StormCloudRun project on its path to version 1.0.

## v0.8.0: The Free Tier Update (Current)
-   **Summary:** Implements a major strategic shift from a user-provided API key to a free, backend-managed AI inference model. The AI assistant is now unlocked for free after a user authenticates with Google. This removes the friction of acquiring and managing an API key, making the AI feature accessible to all users. A mandatory privacy notice has been added to inform users about data usage for this free service.
-   **Rationale:** Removing the API key barrier significantly lowers the entry requirement for using the AI assistant, making it a core, accessible feature of the application rather than a premium add-on. This enhances the product's value and user experience.
-   **Key Changes:**
    -   **Authentication:** Removed all client-side \`geminiApiKey\` state and logic. The AI assistant is now enabled by the \`googleLoggedIn\` state.
    -   **API:** The \`api.assistant.chat\` function signature was changed to remove the \`apiKey\` parameter. It now calls a backend endpoint (\`/api/assistant/chat\`) that will manage authentication with the Code Assist API.
    -   **UI/UX:** The ChatWidget no longer prompts for an API key. It now prompts users to sign in with Google to enable the assistant.
    -   **Privacy:** A \`docs/privacy.md\` file was created and a notice was added to the ChatWidget to comply with the terms of the free AI service.
    -   **Documentation:** All relevant documents (\`docs/modelcard.md\`, \`docs/developer.md\`, \`docs/todo.md\`) were updated to reflect the new authentication model and backend requirements. The version number was incremented to \`0.8.0\`.

## v0.7.0: The Real McCoy Update
-   **Summary:** Implements the client-side portion of a full-stack architecture, enabling real user authentication via a server-side OAuth 2.0 flow. The mock API has been replaced with live \`fetch\` calls to a backend, and the application now performs a session check on startup to verify authentication status. The AI's knowledge base has been significantly enhanced with detailed documentation on OAuth 2.0 and Google Cloud Service Agents.
-   **Rationale:** This is a critical step towards a production-ready application. Moving to a real authentication flow enforces a secure architecture and allows for the development of a real backend that can perform authenticated API calls, as outlined in \`docs/developer.md\`.
-   **Key Changes:**
    -   **Architecture:** Replaced all mock API calls in \`api.ts\` with real \`fetch\` calls designed to communicate with a backend server.
    -   **Authentication:** Implemented the client-side initiation of a server-side OAuth 2.0 flow. The frontend now redirects to backend endpoints for login.
    -   **Session Management:** Added a session verification step on application load to check the user's authentication status with the backend.
    -   **UX:** Added a loading screen during the initial session check for a smoother startup experience.
    -   **AI Knowledge Update:** \`docs.ts\` and \`docs/auth-methods.md\` were significantly updated with provided context on OAuth 2.0 and Google Cloud Service Agents to make the AI assistant an expert on these topics.
    -   **Documentation:** Version numbers across the app and documentation were updated to \`0.7.0\`.

## v0.6.5: The Auth Clarity & Final Stability Update
-   **Summary:** Provides a definitive clarification on the application's authentication model, confirming the use of standard OAuth for users and the role of service accounts as workers. Fixes the root cause of the recurring \`Uncaught SyntaxError\` by re-engineering the context generation logic. Enhances the AI assistant's knowledge with detailed documentation on Secret Manager roles, Google Cloud authentication methods, and a primer on Google Cloud Service Agents.
-   **Rationale:** Permanently fixing the startup error is the top priority for application stability. Clarifying the authentication model and making the AI an expert on it empowers developers to build a secure, correct backend.
-   **Key Changes:**
    -   **Bug Fix:** Corrected the context generation logic to prevent \`Uncaught SyntaxError\` at startup.
    -   **AI Knowledge Update:** \`docs.ts\` was updated with documentation on Service Agents. The \`docs/secrets.md\` and \`docs/auth-methods.md\` files were expanded.
    -   **Code Cleanup:** The obsolete \`components/Console.tsx\` has been removed from the AI's self-awareness context.
    -   **Documentation:** Version numbers across the app and documentation were updated to \`0.6.5\`.`;

export const modelcard = `# StormCloudRun Agent Model Card

## Model Details

-   **Name:** StormCloudRun Deployment Agent
-   **Version:** 0.8.0
-   **Type:** Task-Specific Orchestration Agent
-   **Primary Use:** To facilitate the seamless, guided deployment of source code from a GitHub repository to a Google Cloud Run service, with autonomous error-correction capabilities.

## Intended Use

The StormCloudRun agent is designed for two primary modes of operation:

1.  **UI-Driven (Human-in-the-loop):** A developer uses the StormCloudRun web interface to connect their Google Cloud and GitHub accounts and is guided through the deployment process. The agent's role is to abstract away the complexity of API calls, permissions, and configurations.
2.  **Agent-to-Agent (A2A) / Programmatic:** The agent is designed to be called by other automated systems (e.g., a CI/CD pipeline, a project scaffolding tool, another AI agent) to perform deployments programmatically.

## Key Capabilities

### 1. Multi-Step Orchestration

The agent can manage the entire deployment workflow, which includes:
-   Authenticating with Google Cloud and GitHub via a secure, server-side OAuth 2.0 flow.
-   Listing available Google Cloud projects and Cloud Run services.
-   Listing available GitHub repositories.
-   Granting necessary IAM permissions and enabling required APIs.
-   Initiating a build and deployment process via Google Cloud Build.
-   Providing real-time, structured logging of the deployment progress.

### 2. Retrieval Augmented Generative Engine (RAGE)

StormCloudRun integrates a generative AI assistant with a key RAGE capability for real-time problem-solving:
-   **Self-Awareness (Code & Docs Q&A):** The assistant is provided with the **entire source code and documentation of the StormCloudRun application itself**. This allows it to answer specific questions about its own features, UI components, code architecture, and more, acting as an expert on its own implementation.
-   **Expert Knowledge Base:** The AI is grounded in extensive documentation on Google Cloud topics. Its knowledge now includes detailed overviews of **The OAuth 2.0 Framework**, **Identity and Access Management (IAM)**, **Google Cloud Authentication Methods**, **Google Cloud Service Agents**, **specific IAM roles for source deployments**, **the \`@google-cloud/run\` Node.js client library**, **deploying pre-built container images**, **the Secret Manager API**, **gcloud CLI authorization flows**, **Cloud Build pricing**, and **Cloud Build regional configurations**.
-   **Dynamic Log Analysis:** The agent can analyze a stream of real-time deployment logs to identify errors, warnings, and potential improvements. It provides contextual, actionable advice to help developers debug failed deployments quickly.
-   **Autonomous Self-Correction:** When "Autonomous Mode" is enabled, the RAGE system can take the log analysis a step further. It will propose a structured, actionable code fix (e.g., modifying a \`requirements.txt\` file). With user approval via a single click, the agent applies this fix and re-initiates the deployment, creating an intelligent, self-correcting feedback loop. This process is enhanced by its self-awareness, allowing it to correlate log errors with the actual application code.

## Conceptual API for A2A Interaction

For programmatic use, the StormCloudRun agent would expose a simplified API. See the \`docs/a2a.md\` guide for the full specification.

## Limitations and Ethical Considerations

-   **Security & Authentication:** The AI assistant is now available for free after a user signs in with their Google account. All AI-related API calls are routed through a secure backend service which uses the **Google Code Assist API**. The frontend client never handles API keys or other secrets.
-   **Data Privacy:** The AI assistant is powered by Google's Code Assist API. As a condition of this free service, **prompts and responses may be used by Google to improve their products.** Users must not submit any sensitive or confidential information. A clear privacy notice is displayed in the application, and users agree to these terms by using the assistant.
-   **Scope:** The agent is currently scoped to GitHub and Google Cloud Run. It does not support other source repositories or deployment targets.
-   **"Hallucination" in AI:** While the RAGE capability grounds the AI's analysis in real log data and its own source code, there is always a risk of the generative model providing incorrect or incomplete advice. The autonomous mode requires explicit user approval for any proposed changes to mitigate this risk.
-   **Transparency:** The agent provides real-time feedback on its autonomous actions (e.g., "Analyzing logs...") and transparently reports all applied changes to the user upon successful completion. This is a key feature for maintaining user trust and oversight.
-   **Permissions:** The agent operates with the permissions granted by the user. It is a powerful tool and should be used with caution, as it can make real changes to a user's cloud environment. The UI is designed to be explicit about what permissions it requires and why.
-   **Session Data:** All user state and AI conversation history are isolated and managed on a per-session basis, ensuring that no data is shared between users. State is persisted in the browser's \`sessionStorage\` and is cleared when the session ends or the user resets the application state.`;

export const iam = `# IAM overview

This page describes how Google Cloud's Identity and Access Management (IAM) system works and how you can use it to manage access in Google Cloud.

IAM is a tool to manage fine-grained authorization for Google Cloud. In other words, it lets you control who can do what on which resources.


## Access in Google Cloud
Every action in Google Cloud requires certain permissions. When someone tries to perform an action in Google Cloud—for example, create a VM instance or view a dataset—IAM first checks to see if they have the required permissions. If they don't, then IAM prevents them from performing the action.

Giving someone permissions in IAM involves the following three components:

Principal: The identity of the person or system that you want to give permissions to
Role: The collection of permissions that you want to give the principal
Resource: The Google Cloud resource that you want to let the principal access
To give the principal permission to access the resource, you grant them the role on the resource. You grant these roles using an allow policy.

The following sections describe these concepts in more detail.


## Principals
In Google Cloud you control access for principals. Principals represent one or more identities that have authenticated to Google Cloud.

In the past, principals were referred to as members. Some APIs still use that term.

There are a variety of types of principals in IAM, but they can be divided into two broad categories:

Human users: Some IAM principal types represent human users. You use these principal types for managing your employees' access to Google Cloud resources.

Principal types that represent human users include Google Accounts, Google groups, and federated identities in workforce identity pools.

Workloads: Some IAM principal types represent workloads. You use these principal types when managing your workloads' access Google Cloud resources.

Principal types that represent workloads include service accounts and federated identities in a workload identity pool.

For more information about principals, see IAM principals.


## Permissions and roles
Permissions determine what operations are allowed on a resource. In IAM, permissions are typically represented in the form service.resource.verb. Often, permissions correspond one-to-one with REST API methods—for example, the resourcemanager.projects.list permission lets you list Resource Manager projects.

You can't directly grant permissions to a principal. Instead, you give principals permissions by granting them roles.

Roles are collections of permissions. When you grant a role to a principal, you give that principal all of the permissions in that role.

There are three types of roles:

Predefined roles: Roles that are managed by Google Cloud services. These roles contain the permissions needed to perform common tasks for each given service. For example, the Pub/Sub Publisher role (roles/pubsub.publisher) provides access to publish messages to a Pub/Sub topic.

Custom roles: Roles that you create that contain only the permissions that you specify. You have complete control over the permissions in these roles. However, they have a higher maintenance burden than predefined roles and there's a limit to the number of custom roles that you can have in your project and in your organization.

Basic roles: Highly permissive roles that provide broad access to Google Cloud services. These roles can be useful for testing purposes, but shouldn't be used in production environments.

For more information about roles and permissions, see Roles and permissions.

## Resources
Most Google Cloud services have their own resources. For example, Compute Engine has resources like instances, disks, and subnetworks.

In IAM, you grant roles on a resource. Granting a principal a role on a resource means that the principal can use the permissions in that role to access the resource.

You can grant roles on a subset of Google Cloud resources. For a full list of resources that you can grant roles on, see Resource types that accept allow policies.

Google Cloud also has several container resources, including projects, folders, and organizations. Granting a principal a role on a container resource gives the principal access the container resource and the resources in that container. This feature lets you use a single role grant to give a principal access to multiple resources, including resources that you can't grant roles on directly. For more information, see Policy inheritance on this page.


## Allow policies
You grant roles to principals using allow policies. In the past, these policies were referred to as IAM policies.

An allow policy is a YAML or JSON object that's attached to a Google Cloud resource.

Each allow policy contains a list of role bindings that associate IAM roles with the principals who are granted those roles.

When an authenticated principal attempts to access a resource, IAM checks the resource's allow policy to determine whether the principal has the required permissions. If the principal is in a role binding that includes a role with the required permissions, then they're allowed to access the resource.

To see examples of allow policies and learn about their structure, see Understanding allow policies.


## Policy inheritance
Google Cloud has container resources—such as projects, folders, and organizations—that let you organize your resources in a parent-child hierarchy. This hierarchy is called the resource hierarchy.

The Google Cloud resource hierarchy has the following structure:

The organization is the root node in the hierarchy.
Folders are children of the organization, or of another folder.
Projects are children of the organization, or of a folder.
Resources for each service are descendants of projects.

If you set an allow policy on a container resource, then the allow policy also applies to all resources in that container. This concept is called policy inheritance, because descendant resources effectively inherit their ancestor resources' allow policies.

Policy inheritance has the following implications:

You can use a single role binding to grant access to multiple resources. If you want to give a principal access to all resources in a container, then grant them a role on the container instead of on the resources in the container.

For example, if you want to let your security administrator manage allow policies for all resources in your organization, then you could grant them the Security Admin role (roles/iam.securityAdmin) on the organization.

You can grant access to resources that don't have their own allow policies. Not all resources accept allow policies, but all resources inherit allow policies from their ancestors. To give a principal access to a resource that can't have its own allow policy, grant them a role on one of the resource's ancestors.

For example, imagine you want to give someone permission to write logs to a log bucket. Log buckets don't have their own allow policies, so to give someone this permission, you can instead grant them the Logs Bucket Writer role (roles/logging.bucketWriter) on the project that contains the log bucket.

To understand who can access a resource, you need to also view all of the allow policies that affect the resource. To get a complete list of the principals that have access to the resource, you need to view the resource's allow policy and the resource's ancestors' allow policies. The union of all of these policies is called the effective allow policy.

## Custom roles
IAM also lets you create custom IAM roles. Custom roles help you enforce the principle of least privilege, because they help to ensure that the principals in your organization have only the permissions that they need.

Custom roles are user-defined, and allow you to bundle one or more supported permissions to meet your specific needs. When you create a custom role, you must choose an organization or project to create it in. You can then grant the custom role on the organization or project, as well as any resources within that organization or project.

You can only grant a custom role within the project or organization in which you created it. You cannot grant custom roles on other projects or organizations, or on resources within other projects or organizations.`;

export const a2a = `# StormCloudRun Agent-to-Agent (A2A) API Specification

## 1. Overview

This document outlines the conceptual API for programmatically interacting with the StormCloudRun agent. This API is designed for automated systems, such as CI/CD pipelines, project scaffolding tools, or other AI agents, to trigger and manage deployments without direct human interaction through the UI.

The core principle is to provide a single, powerful endpoint that accepts a comprehensive deployment configuration and returns a stream of structured logs, culminating in a final status.

## 2. Authentication

The A2A API assumes the calling agent has already obtained the necessary OAuth 2.0 access tokens for both Google Cloud and GitHub. These tokens must be passed in the request payload. The StormCloudRun backend will then use these tokens to perform actions on behalf of the user.

-   **Google Cloud Token:** Must have scopes for Resource Manager, Cloud Build, Cloud Run, Service Usage, and IAM.
-   **GitHub Token:** Must have scopes for reading repository content (\`repo\`). If the autonomous mode needs to push fixes, it will require write access (\`repo\`).

## 3. The \`deploy\` Endpoint

This is the primary endpoint for all A2A interactions.

**\`POST /api/agent/deploy\`**

### 3.1. Request Body

The request body is a JSON object with the following structure:

\`\`\`json
{
  "google_credentials": {
    "oauth_access_token": "ya29.c.b0..."
  },
  "github_credentials": {
    "oauth_access_token": "gho_..."
  },
  "project_id": "your-gcp-project-id",
  "github_repo_url": "https://github.com/your-username/your-repo-name",
  "deployment_config": {
    "target": "new_service",
    "service_name": "my-new-app-from-api",
    "existing_service_id": null,
    "region": "us-central1",
    "build_strategy": "buildpacks",
    "dockerfile_path": "./Dockerfile",
    "environment_variables": [
      { "key": "NODE_ENV", "value": "production" }
    ],
    "secrets": [
      { "name": "API_KEY", "version": "latest", "envVarName": "APP_API_KEY" }
    ],
    "scaling": {
      "min_instances": 0,
      "max_instances": 10
    }
  },
  "options": {
    "enable_ci": true,
    "autonomous_mode": {
      "enabled": true,
      "max_iterations": 3
    }
  }
}
\`\`\`

### 3.2. Field Descriptions

| Path                                    | Type      | Required | Description                                                                                                                                                             |
| --------------------------------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \`google_credentials.oauth_access_token\` | \`string\`  | Yes      | The user's Google Cloud OAuth 2.0 access token.                                                                                                                         |
| \`github_credentials.oauth_access_token\` | \`string\`  | Yes      | The user's GitHub OAuth 2.0 access token.                                                                                                                               |
| \`project_id\`                            | \`string\`  | Yes      | The target Google Cloud Project ID.                                                                                                                                     |
| \`github_repo_url\`                       | \`string\`  | Yes      | The full URL of the GitHub repository to deploy.                                                                                                                        |
| \`deployment_config\`                     | \`object\`  | Yes      | Container for all service configuration details.                                                                                                                        |
| \`deployment_config.target\`              | \`string\`  | Yes      | Either \`"new_service"\` or \`"existing_service"\`.                                                                                                                         |
| \`deployment_config.service_name\`        | \`string\`  | Yes if new | The name for the new Cloud Run service. Must be unique.                                                                                                                 |
| \`deployment_config.existing_service_id\` | \`string\`  | Yes if existing | The ID of the existing Cloud Run service to deploy to.                                                                                                           |
| \`deployment_config.region\`              | \`string\`  | Yes      | The Google Cloud region for the deployment (e.g., "us-central1").                                                                                                       |
| \`deployment_config.build_strategy\`      | \`string\`  | No       | Either \`"buildpacks"\` (default) or \`"dockerfile"\`.                                                                                                                      |
| \`deployment_config.dockerfile_path\`     | \`string\`  | No       | The path to the Dockerfile within the repository, if using that strategy. Defaults to \`./Dockerfile\`.                                                                    |
| \`deployment_config.environment_variables\` | \`array\`   | No       | An array of \`{ "key": "string", "value": "string" }\` objects.                                                                                                           |
| \`deployment_config.secrets\`             | \`array\`   | No       | An array of \`{ "name": "string", "version": "string", "envVarName": "string" }\` objects.                                                                                |
| \`deployment_config.scaling\`             | \`object\`  | No       | An object with \`{ "min_instances": number, "max_instances": number }\`.                                                                                                  |
| \`options\`                               | \`object\`  | No       | Container for automation options.                                                                                                                                       |
| \`options.enable_ci\`                     | \`boolean\` | No       | If \`true\`, a Cloud Build trigger will be created for CI/CD. Defaults to \`false\`.                                                                                        |
| \`options.autonomous_mode\`               | \`object\`  | No       | Configuration for the self-correction feature.                                                                                                                          |
| \`options.autonomous_mode.enabled\`       | \`boolean\` | No       | If \`true\`, the agent will attempt to fix build errors. Defaults to \`false\`.                                                                                               |
| \`options.autonomous_mode.max_iterations\`| \`number\`  | No       | The maximum number of fix-and-retry attempts. Defaults to \`3\`.                                                                                                          |

### 3.4. Response

The API will respond with a \`200 OK\` status and a streaming response body (\`Content-Type: application/x-ndjson\`). Each line of the response will be a JSON object representing a batch of structured log entries.

**Log Entry Format:**

\`\`\`json
[
  {
    "timestamp": "2025-08-01T14:30:05.123Z",
    "level": "INFO",
    "message": "Starting build..."
  }
]
\`\`\`

The final log entry in the stream will have a \`level\` of \`"SUCCESS"\` or \`"ERROR"\` and will contain the final status. If successful, the message will include the live URL of the deployed service.

**Example Final Success Log:**
\`\`\`json
[
  {
    "timestamp": "2025-08-01T14:35:10.456Z",
    "level": "SUCCESS",
    "message": "Service deployed successfully. URL: https://my-new-app-from-api-117975713968.us-central1.run.app"
  }
]
\`\`\``;

export const secrets = `# Secret Manager API

Stores sensitive data such as API keys, passwords, and certificates. Provides convenience while improving security.

**Service:** \`secretmanager.googleapis.com\`

To call this service, we recommend that you use the Google-provided client libraries. If your application needs to use your own libraries to call this service, use the following information when you make the API requests.

## Discovery document
A Discovery Document is a machine-readable specification for describing and consuming REST APIs. It is used to build client libraries, IDE plugins, and other tools that interact with Google APIs. One service may provide multiple discovery documents. This service provides the following discovery documents:

-   \`https://secretmanager.googleapis.com/$discovery/rest?version=v1\`
-   \`https://secretmanager.googleapis.com/$discovery/rest?version=v1beta1\`

## Service endpoint
A service endpoint is a base URL that specifies the network address of an API service. One service might have multiple service endpoints. This service has the following service endpoint and all URIs below are relative to this service endpoint:

-   \`https://secretmanager.googleapis.com\`

## REST Resources

### \`v1.projects.secrets\`

| Method | HTTP Verb & Path | Description |
|---|---|---|
| addVersion | \`POST /v1/{parent=projects/*/secrets/*}:addVersion\` | Creates a new SecretVersion containing secret data and attaches it to an existing Secret. |
| create | \`POST /v1/{parent=projects/*}/secrets\` | Creates a new Secret containing no SecretVersions. |
| delete | \`DELETE /v1/{name=projects/*/secrets/*}\` | Deletes a Secret. |
| get | \`GET /v1/{name=projects/*/secrets/*}\` | Gets metadata for a given Secret. |
| getIamPolicy | \`GET /v1/{resource=projects/*/secrets/*}:getIamPolicy\` | Gets the access control policy for a secret. |
| list | \`GET /v1/{parent=projects/*}/secrets\` | Lists Secrets. |
| patch | \`PATCH /v1/{secret.name=projects/*/secrets/*}\` | Updates metadata of an existing Secret. |
| setIamPolicy | \`POST /v1/{resource=projects/*/secrets/*}:setIamPolicy\` | Sets the access control policy on the specified secret. |
| testIamPermissions | \`POST /v1/{resource=projects/*/secrets/*}:testIamPermissions\` | Returns permissions that a caller has for the specified secret. |

### \`v1.projects.secrets.versions\`

| Method | HTTP Verb & Path | Description |
|---|---|---|
| access | \`GET /v1/{name=projects/*/secrets/*/versions/*}:access\` | Accesses a SecretVersion. |
| destroy | \`POST /v1/{name=projects/*/secrets/*/versions/*}:destroy\` | Destroys a SecretVersion. |
| disable | \`POST /v1/{name=projects/*/secrets/*/versions/*}:disable\` | Disables a SecretVersion. |
| enable | \`POST /v1/{name=projects/*/secrets/*/versions/*}:enable\` | Enables a SecretVersion. |
| get | \`GET /v1/{name=projects/*/secrets/*/versions/*}\` | Gets metadata for a SecretVersion. |
| list | \`GET /v1/{parent=projects/*/secrets/*}/versions\` | Lists SecretVersions. |

## Secret Manager Roles

| Role | Permissions |
| --- | --- |
| **Secret Manager Admin** <br/> \`roles/secretmanager.admin\` | Full access to administer Secret Manager resources. |
| **Secret Manager Secret Accessor** <br/> \`roles/secretmanager.secretAccessor\` | Allows accessing the payload of secrets. |
| **Secret Manager Secret Version Adder** <br/> \`roles/secretmanager.secretVersionAdder\` | Allows adding versions to existing secrets. |
| **Secret Manager Secret Version Manager** <br/> \`roles/secretmanager.secretVersionManager\` | Allows creating and managing versions of existing secrets. |
| **Secret Manager Viewer** <br/> \`roles/secretmanager.viewer\` | Allows viewing metadata of all Secret Manager resources. |


## Secret Manager Permissions

| Permission | Included in roles |
| --- | --- |
| \`secretmanager.locations.get\` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Viewer |
| \`secretmanager.secrets.create\` | Owner, Editor, Secret Manager Admin |
| \`secretmanager.secrets.get\` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Viewer |
| \`secretmanager.secrets.list\` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Viewer |
| \`secretmanager.secrets.update\` | Owner, Editor, Secret Manager Admin |
| \`secretmanager.secrets.delete\` | Owner, Editor, Secret Manager Admin |
| \`secretmanager.versions.access\` | Owner, Secret Manager Admin, Secret Manager Secret Accessor |
| \`secretmanager.versions.add\` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Adder, Secret Manager Secret Version Manager |
| \`secretmanager.versions.destroy\` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Manager |
| \`secretmanager.versions.disable\` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Manager |
| \`secretmanager.versions.enable\` | Owner, Editor, Secret Manager Admin, Secret Manager Secret Version Manager |
| \`secretmanager.versions.get\` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Secret Version Manager, Secret Manager Viewer |
| \`secretmanager.versions.list\` | Owner, Editor, Viewer, Secret Manager Admin, Secret Manager Secret Version Manager, Secret Manager Viewer |
| \`secretmanager.secrets.getIamPolicy\` | Owner, Security Admin, Secret Manager Admin, Secret Manager Viewer |
| \`secretmanager.secrets.setIamPolicy\` | Owner, Security Admin, Secret Manager Admin |`;

export const buildLocations = `# Cloud Build locations

Cloud Build supports regional builds in private pools and default pools.

When selecting a region for your builds, your primary considerations should be latency and availability. You can generally select the region closest to your Cloud Build's users, but you should also consider the location of the other Google Cloud products and services that your build might integrate with. Using services across multiple locations can affect your app's latency, as well as pricing.

Cloud Build is available in the following regions:

- africa-south1
- asia-east1
- asia-east2
- asia-northeast1
- asia-northeast2
- asia-northeast3
- asia-south1
- asia-south2
- asia-southeast1
- asia-southeast2
- australia-southeast1
- australia-southeast2
- europe-central2
- europe-north1
- europe-west1
- europe-west2
- europe-west3
- europe-west4
- europe-west6
- us-central1
- us-east1
- us-east4
- us-west1
- us-west2
- us-west3
- us-west4

## Restricted regions for some projects
Depending on usage, certain projects may be restricted to only use Cloud Build in the following regions:

- us-central1
- us-west2
- europe-west1
- asia-east1
- australia-southeast1
- southamerica-east1`;

export const authMethods = `# Authentication Methods in StormCloudRun

This document outlines the authentication methods used by the StormCloudRun application to securely interact with Google Cloud and GitHub APIs on behalf of the user.

## The Core Principle: Server-Side OAuth 2.0

For security reasons, a client-side application (like our React frontend) **must never** handle or store sensitive credentials like OAuth tokens or API keys. All authentication is managed by a dedicated **backend server**. The frontend's role is simply to initiate the authentication process and then operate using a secure session cookie provided by the backend.

We use the **OAuth 2.0 Authorization Code Grant Flow**, which is the industry standard for server-side applications.

### The Flow Explained

Here is a step-by-step breakdown of how a user logs into StormCloudRun:

1.  **User Action:** The user clicks the "Sign in with Google" button in the frontend application.

2.  **Frontend Redirect:** The React app doesn't call Google directly. Instead, it redirects the user's browser to our own backend endpoint, for example: \`https://stormcloud.run/api/auth/google\`.

3.  **Backend Initiates OAuth:** The backend server receives this request. It then constructs the proper Google OAuth 2.0 consent screen URL, including our application's \`client_id\`, the required \`scopes\` (like \`cloud-platform\` and \`project.readonly\`), and a \`redirect_uri\` that points back to our backend (\`https://stormcloud.run/api/auth/google/callback\`). The backend then redirects the user's browser to this Google URL.

4.  **User Consent:** The user is now on a secure Google domain. They see a standard consent screen asking for permission for "StormCloudRun" to access their Google Cloud data. The user authenticates (if they aren't already) and clicks "Allow".

5.  **Google Redirects with Code:** Google redirects the user's browser back to the \`redirect_uri\` we specified in step 3. This request from Google includes a temporary, one-time-use **authorization code** as a query parameter (e.g., \`?code=4/0Ab...\`).

6.  **Backend Exchanges Code for Tokens:** Our backend's callback endpoint (\`/api/auth/google/callback\`) receives this request. It securely, on the server-side, makes a \`POST\` request to Google's token endpoint. This request includes the \`authorization_code\`, our \`client_id\`, and our **\`client_secret\`**.

7.  **Tokens Received:** Google verifies the code and credentials and, if valid, returns an \`access_token\` and a \`refresh_token\` to our backend. The \`access_token\` is used to make API calls, and the \`refresh_token\` is used to get a new access token when the old one expires.

8.  **Session Creation:** The backend securely encrypts and stores these tokens (ideally in a database, linked to a user record). It then creates a session for the user and sends a secure, \`HttpOnly\` session cookie back to the user's browser.

9.  **Authenticated State:** The browser now has a session cookie. The frontend application reloads, and its initial "check session" call to the backend (\`/api/me\`) now succeeds. The backend identifies the user via their session cookie, and the frontend can now display their logged-in state (e.g., "Logged in as user@example.com").

All subsequent requests from the frontend to the backend (e.g., "list my projects") are authenticated using this session cookie. The backend receives the request, loads the user's tokens from storage, and uses those tokens to make the actual authenticated API call to Google Cloud.

This flow ensures that sensitive tokens are never exposed to the browser, providing a robust and secure authentication system. The process for GitHub is identical.`;

export const oauthClients = `# Manage OAuth Clients
Your OAuth client is the credential which your application uses when making calls to Google OAuth 2.0 endpoint to receive an access token or ID token. After creating your OAuth client, you will receive a client ID and sometimes, a client secret.

Think of your client ID like your app's unique username when it needs to request an access token or ID token from Google's OAuth 2.0 endpoint. This ID helps Google identify your app and ensure that only authorized applications can access user data.

## Client ID and Client Secret
Similar to how you would use a username and password to log to online services, many applications use a client ID paired with a client secret. The client secret adds an extra layer of security, acting like your app's password.

Applications are categorized as either public or private clients:

**Private Clients:** These apps, like web server applications, can securely store the client secret because they run on servers you control.
**Public Clients:** Native apps or JavaScript-based apps fall under this category. They cannot securely store secrets, as they reside on user devices and as such do not use client secrets. 
To create an OAuth 2.0 client ID in the console: 

1. Navigate to the Google Auth Platform Clients page. 
2. You will be prompted to create a project if you do not have one selected. 
3. You will be prompted to register your application to use Google Auth if you are yet to do so. This is required before creating a client.   
4. Click CREATE CLIENT
5. Select the appropriate application type for your application and enter any additional information required. Application types are described in more detail in the following sections.
6. Fill out the required information for the select client type and click the CREATE button to create the client.

**Note:** Your application's client secret will only be shown after you create the client. Store this information in a secure place such as Google Cloud Secret Manager because it will not be visible or accessible again. Learn more.

## Application types
 
* Web Applications
* Native Applications (Android, iOS, Desktop, UWP, Chrome Extensions, TV and Limited Input)

## Delete OAuth Clients
To delete a client ID, go to the Clients page, check the box next to the ID you want to delete, and then click the DELETE button.

Before deleting a Client ID, ensure to check the ID is not in use by monitoring your traffic in the overview page.  

You can restore deleted clients within 30 days of the deletion. To restore a recently deleted client, navigate to the Deleted credentials page to find a list of clients you recently deleted and click the RESTORE button for the client you want to restore.  

Any client deleted over 30 days ago cannot be restored and is permanently deleted. 

**Note**: Clients can also be automatically deleted if they become inactive. Learn more.

## Rotating your clients secrets
Client secrets or credentials should be treated with extreme care as described in the OAuth 2.0 policies, because they allow anyone who has them to use your app's identity to gain access to user information. With the client secret rotation feature, you can add a new secret to your OAuth client configuration, migrate to the new secret while the old secret is still usable, and disable the old secret afterwards. This is useful when the client secret has been inadvertently disclosed or leaked. This also ensures good security practices by occasionally rotating your secrets without causing downtime of your app. In addition, Google started to issue more secure client secrets recommended by RFC 6749 in 2021. While apps that were created earlier are able to continue using the old secrets, we recommend that you migrate to the new secret with this rotation feature. 

To rotate your client secret, please follow the following steps:

1. Step 1: Create a new client secret
2. Step 2: Configure your app to use the new secret
3. Step 3: Disable the old secret
4. Step 4: Delete the old secret
 
## Unused Client Deletion
OAuth 2.0 clients that have been inactive for six months are automatically deleted. This mitigates risks associated with unused client credentials, such as potential app impersonation or unauthorized data access if credentials are compromised.

An OAuth 2.0 client is considered unused if neither of the following actions have occurred within the past six months:

* The client has not been used for any credential or token request via the Google OAuth2.0 endpoint.
* The client's settings have not been modified programmatically or manually within the Google Cloud Console. Examples of modifications include changing the client name, rotating the client secret, or updating redirect URIs.

You will receive an email notification 30 days before an inactive client is scheduled for deletion. To prevent the automatic deletion of a client you still require, ensure it is used for an authorization or authorization request before the 30 days elapses. 

A notification will also be sent after the client has been successfully deleted.

**Note** : You should only take action to prevent deletion if you actively require the client. Keeping unused clients active unnecessarily increases security risk for your application. If you determine a client is no longer needed, delete it yourself via the Google Auth Platform Clients page. Do not wait for the automatic deletion process.

Once an OAuth 2.0 client is deleted:

* It can no longer be used for Sign in with Google or for authorization for data access.
* Calls to Google APIs using existing access tokens or refresh tokens associated with the deleted client will fail.
* Attempts to use the deleted client ID in authorization requests will result in a deleted_client error.

Deleted clients are typically recoverable at least 30 days following deletion. To restore a deleted client, navigate to the Deleted Credentials page. Only restore a client if you have a confirmed, ongoing need for it.   

To ensure that you receive these notifications and others related to your app, review your contact information settings.

## Client Secret Handling and Visibility
**Note:** This feature is currently available for new clients created after June 2025 and will be extended to existing clients at a later date.

In April 2025, we announced that client secrets for OAuth 2.0 clients are only visible and downloadable from the Google Cloud Console at the time of their creation. 

Client secrets add a critical layer of security to your OAuth 2.0 client ID, functioning similarly to a password for your application. Protecting these secrets is important for maintaining application security and privacy. To prevent accidental exposure and increase protection, client secrets are hashed. This means you will only be able to view and download the full client secret once, at the time of its creation.

It is important that you download your OAuth 2.0 client secrets immediately upon creation and store them in a secure manner, for example in a secret manager such as Google Cloud Secret Manager.

After the initial creation, the Google Cloud Console will only display the last four characters of the client secret. This truncated version is provided solely for identification purposes, allowing you to distinguish between your client secrets. If you lose your client secret, you can use the client secret rotation feature to get a new one.

### Best Practices for Client Secret Management

* Never add client secrets directly in your code or check them into version control systems such as Git or Subversion. 
* Do not share client secrets in public forums, email, or other insecure communication channels.
* Store client secrets securely using a dedicated secret management service like Google Cloud Secret Manager or a similar secure storage solution.
* Rotate client secrets periodically and change immediately in the case of a leak.`;

export const clientSideAuth = `# OAuth 2.0 for Client-side Web Applications

This document explains how to implement OAuth 2.0 authorization to access Google APIs from a JavaScript web application. OAuth 2.0 allows users to share specific data with an application while keeping their usernames, passwords, and other information private. For example, an application can use OAuth 2.0 to obtain permission from users to store files in their Google Drives.

This OAuth 2.0 flow is called the **implicit grant flow**. It is designed for applications that access APIs only while the user is present at the application. These applications are not able to store confidential information.

In this flow, your app opens a Google URL that uses query parameters to identify your app and the type of API access that the app requires. You can open the URL in the current browser window or a popup. The user can authenticate with Google and grant the requested permissions. Google then redirects the user back to your app. The redirect includes an access token, which your app verifies and then uses to make API requests.

## Prerequisites
### Create authorization credentials
Any application that uses OAuth 2.0 to access Google APIs must have authorization credentials that identify the application to Google's OAuth 2.0 server. 

1. Go to the **Clients page** in the Google Cloud Console.
2. Click **Create Client**.
3. Select the **Web application** application type.
4. Complete the form. Applications that use JavaScript to make authorized Google API requests must specify **authorized JavaScript origins**. The origins identify the domains from which your application can send requests to the OAuth 2.0 server. 

### Identify access scopes
Scopes enable your application to only request access to the resources that it needs while also enabling users to control the amount of access that they grant to your application. Thus, there may be an inverse relationship between the number of scopes requested and the likelihood of obtaining user consent.

## Obtaining OAuth 2.0 access tokens
The following steps show how your application interacts with Google's OAuth 2.0 server to obtain a user's consent to perform an API request on the user's behalf. Your application must have that consent before it can execute a Google API request that requires user authorization.

### Step 1: Redirect to Google's OAuth 2.0 server
To request permission to access a user's data, redirect the user to Google's OAuth 2.0 server at \`https://accounts.google.com/o/oauth2/v2/auth\`.

The authorization server supports the following query string parameters:

- **\`client_id\` (Required)**: The client ID for your application.
- **\`redirect_uri\` (Required)**: Determines where the API server redirects the user after the user completes the authorization flow. The value must exactly match one of the authorized redirect URIs for the OAuth 2.0 client.
- **\`response_type\` (Required)**: JavaScript applications must set the parameter's value to \`token\`. This value instructs the Google Authorization Server to return the access token in the fragment identifier of the redirect URI.
- **\`scope\` (Required)**: A space-delimited list of scopes that identify the resources that your application could access on the user's behalf.
- **\`state\` (Recommended)**: An opaque value used to maintain state between the request and the response, and to prevent cross-site request forgery (CSRF).
- **\`include_granted_scopes\` (Optional)**: Enables incremental authorization.
- **\`login_hint\` (Optional)**: Provides a hint to the server about the user trying to authenticate.
- **\`prompt\` (Optional)**: A space-delimited list of prompts to present the user, such as \`consent\` or \`select_account\`.

### Step 2: Google prompts user for consent
In this step, the user decides whether to grant your application the requested access. Google displays a consent window showing the name of your application and the Google API services it is requesting permission to access.

### Step 3: Handle the OAuth 2.0 server response
The OAuth 2.0 server sends a response to the \`redirect_uri\` specified in your access token request. **Before handling the response, you must confirm that the state received from Google matches the state you sent.**

If the user approves the request, the response contains an access token in the URL's hash fragment.
- **Access token response**: \`https://oauth2.example.com/callback#access_token=4/P7q7W91&token_type=Bearer&expires_in=3600&state=...\`
- **Error response**: \`https://oauth2.example.com/callback#error=access_denied\`

### Step 4: Call Google APIs
After your application obtains an access token, you can use the token to make calls to a Google API on behalf of a given user account. To do this, include the access token in a request to the API by including either an \`access_token\` query parameter or an \`Authorization: Bearer\` HTTP header.`;

export const privacy = `# Privacy Notice for AI Assistant

## Data Usage for Free Tier

The AI Assistant in StormCloudRun is powered by Google's Code Assist service and is provided as a free tier to authenticated users.

To provide this service for free, please be aware of the following:

-   **Your prompts and the responses you receive may be used by Google to improve their products and machine-learning models.**
-   While you can limit some data collection in your Google Activity Controls, it cannot be completely disabled for this service.
-   You should not submit any sensitive, confidential, or personal information in your conversations with the assistant.

For more detailed information, please review **[Google's Privacy Policy](https://policies.google.com/privacy)** and the terms applicable to the generative AI services you use. Your use of the AI assistant constitutes your agreement to these terms.`;

export const freeAiService = `# Free AI Service: Backend Implementation Guide

This document contains the reference implementation for the backend service that provides free AI chat capabilities after a user has authenticated with Google. This service uses the Google Code Assist API.

The frontend is already configured to call the \`/api/assistant/chat\` endpoint. The backend must implement this endpoint using the logic outlined below.

## Core Concepts

1.  **Server-Side OAuth 2.0:** The backend handles the entire OAuth 2.0 flow, including storing and refreshing tokens. The client secret is never exposed to the frontend.
2.  **Credential Caching:** Caches the user's OAuth credentials locally (\`~/.gemini/oauth_creds.json\` in this example) to avoid repeated logins. In a production multi-user environment, this should be a secure, user-scoped database store.
3.  **User Onboarding:** The first time a user connects, the service "onboards" them with the Code Assist API.
4.  **Authenticated Inference:** All calls to the Code Assist endpoint are authenticated using the user's OAuth token.

## Reference Implementation (Node.js)

\`\`\`javascript
import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import * as crypto from 'crypto';
import open from 'open';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

class FreeAIService {
  constructor() {
    this.client = null;
    this.isAuthenticated = false;
    this.endpoint = 'https://cloudcode-pa.googleapis.com/v1internal';
    
    // OAuth configuration for AI service
    this.oauthConfig = {
      clientId: process.env.AI_CLIENT_ID || 'your-client-id',
      clientSecret: process.env.AI_CLIENT_SECRET || 'your-client-secret',
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    };
  }

  async initialize() {
    if (this.isAuthenticated) return;
    
    console.log('🔐 Initializing free AI service...');
    this.client = await this.authenticate();
    await this.setupUser();
    this.isAuthenticated = true;
    console.log('✅ AI service ready!');
  }

  async authenticate() {
    const client = new OAuth2Client({
      clientId: this.oauthConfig.clientId,
      clientSecret: this.oauthConfig.clientSecret
    });

    // Try to load cached credentials
    if (await this.loadCachedCredentials(client)) {
      return client;
    }

    // Perform web-based OAuth flow
    const webLogin = await this.authWithWeb(client);
    console.log('\\n🌐 Opening browser for Google authentication...');
    await open(webLogin.authUrl);
    console.log('⏳ Waiting for authentication...');
    await webLogin.loginCompletePromise;
    
    return client;
  }

  async loadCachedCredentials(client) {
    try {
      const credsPath = path.join(os.homedir(), '.gemini', 'oauth_creds.json');
      const creds = await fs.readFile(credsPath, 'utf-8');
      client.setCredentials(JSON.parse(creds));
      
      // Verify credentials are still valid
      const { token } = await client.getAccessToken();
      if (!token) return false;
      
      await client.getTokenInfo(token);
      return true;
    } catch {
      return false;
    }
  }

  async authWithWeb(client) {
    const port = await this.getAvailablePort();
    const redirectUri = \`http://localhost:\${port}/oauth2callback\`;
    const state = crypto.randomBytes(32).toString('hex');
    
    const authUrl = client.generateAuthUrl({
      redirect_uri: redirectUri,
      access_type: 'offline',
      scope: this.oauthConfig.scopes,
      state
    });

    const loginCompletePromise = new Promise((resolve, reject) => {
      const server = http.createServer(async (req, res) => {
        try {
          if (!req.url?.includes('/oauth2callback')) {
            res.writeHead(301, { Location: 'https://developers.google.com/gemini-code-assist/auth_failure_gemini' });
            res.end();
            reject(new Error('Unexpected request'));
            return;
          }

          const url = new URL(req.url, 'http://localhost:3000');
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');
          const returnedState = url.searchParams.get('state');

          if (error) {
            res.writeHead(301, { Location: 'https://developers.google.com/gemini-code-assist/auth_failure_gemini' });
            res.end();
            reject(new Error(\`Authentication error: \${error}\`));
            return;
          }

          if (returnedState !== state) {
            res.end('State mismatch. Possible CSRF attack');
            reject(new Error('State mismatch'));
            return;
          }

          if (code) {
            const { tokens } = await client.getToken({
              code,
              redirect_uri: redirectUri
            });
            client.setCredentials(tokens);
            await this.cacheCredentials(tokens);

            res.writeHead(301, { Location: 'https://developers.google.com/gemini-code-assist/auth_success_gemini' });
            res.end();
            resolve();
          } else {
            reject(new Error('No authorization code received'));
          }
        } catch (e) {
          reject(e);
        } finally {
          server.close();
        }
      });
      server.listen(port);
    });

    return { authUrl, loginCompletePromise };
  }

  async getAvailablePort() {
    return new Promise((resolve) => {
      const server = http.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
    });
  }

  async cacheCredentials(tokens) {
    const credsPath = path.join(os.homedir(), '.gemini', 'oauth_creds.json');
    await fs.mkdir(path.dirname(credsPath), { recursive: true });
    await fs.writeFile(credsPath, JSON.stringify(tokens));
  }

  async setupUser() {
    const clientMetadata = {
      ideType: 'IDE_UNSPECIFIED',
      platform: 'PLATFORM_UNSPECIFIED',
      pluginType: 'GEMINI',
      duetProject: process.env.GOOGLE_CLOUD_PROJECT
    };

    // Load user configuration
    const loadRes = await this.callEndpoint('loadCodeAssist', {
      cloudaicompanionProject: process.env.GOOGLE_CLOUD_PROJECT,
      metadata: clientMetadata
    });

    // Onboard user
    const onboardReq = {
      tierId: this.getOnboardTier(loadRes).id,
      cloudaicompanionProject: process.env.GOOGLE_CLOUD_PROJECT,
      metadata: clientMetadata
    };

    let lroRes = await this.callEndpoint('onboardUser', onboardReq);
    while (!lroRes.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      lroRes = await this.callEndpoint('onboardUser', onboardReq);
    }
  }

  getOnboardTier(res) {
    if (res.currentTier) return res.currentTier;
    for (const tier of res.allowedTiers || []) {
      if (tier.isDefault) return tier;
    }
    return { id: 'free-tier' };
  }

  async callEndpoint(method, data) {
    const response = await this.client.request({
      url: \`\${this.endpoint}:\${method}\`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify(data)
    });
    return response.data;
  }

  async chat(context, userMessage) {
    await this.initialize();

    const prompt = \`
You are a helpful AI assistant for an application. Here's the context about the app:

\${context}

User question: \${userMessage}

Please provide a helpful, accurate response based on the app context. Be concise but thorough.
\`;

    try {
      const response = await this.client.request({
        url: \`\${this.endpoint}:generateContent\`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          },
          cloudaicompanionProject: process.env.GOOGLE_CLOUD_PROJECT
        })
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      }
      throw new Error(\`AI service error: \${error.message}\`);
    }
  }
}
\`\`\``;

export const selfHosting = `# How-To Guide: Setting Up Google OAuth for a Cloud Run Management App

This guide walks you through setting up a Google Cloud project to act as a secure web application. The application will use Google's OAuth 2.0 (Authorization Code Flow) to get permission from users to manage resources (specifically Cloud Build and Cloud Run) in their own Google Cloud projects.

## Phase 1: Configure Your Application's Identity

These steps are performed in your Google Cloud project (e.g., \`eternal-delight-435801-c0\`), which hosts your management application.

### Step 1. Configure the OAuth Consent Screen
This is the permission screen your users will see.

1.  Navigate to the [Google Cloud Console](https://console.cloud.google.com/)
2.  Ensure your project that will host StormCloudRun is selected at the top of the page.
3.  Go to the navigation menu (☰) -> **APIs & Services** -> **OAuth consent screen**.
4.  **User Type**: Select **External** and click **Create**.
5.  **App Information**:
    *   Fill in the **App name** (e.g., "StormCloud Deployer"), **User support email**, and your developer contact information. An app logo is highly recommended.
6.  **Scopes**:
    *   Click **Add or Remove Scopes**.
    *   Add the following three scopes, which are essential for your application's function:
        *   \`.../auth/userinfo.email\` (To know who the user is)
        *   \`https://www.googleapis.com/auth/cloudbuild.builds\` (To create container builds in the user's project)
        *   \`https://www.googleapis.com/auth/run.admin\` (To deploy services to Cloud Run in the user's project)
7.  **Test Users**:
    *   While your app is in "Testing" mode, only registered test users can use it. Click **Add Users** and add your own Google Account(s). You can add up to 100 test users.
8.  Review the summary and save.

### Step 2. Create the OAuth Client ID & Secret
This generates your application's unique "passport" and "password".

1.  Go to the navigation menu (☰) -> **APIs & Services** -> **Credentials**.
2.  Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
3.  **Application type**: Select **Web application**.
4.  **Name**: Give it a descriptive name, e.g., \`StormCloud Web Client\`.
5.  **Authorized JavaScript origins**:
    *   Add the base URL of your deployed Cloud Run service:
        *   \`https://[YOUR_HOSTING_SERVICE_URL].run.app\`
6.  **Authorized redirect URIs**:
    *   Add the specific backend endpoint that will handle the login callback. This must match your application code exactly.
        *   \`https://[YOUR_HOSTING_SERVICE_URL].run.app/oauth2/callback\`
7.  Click **CREATE**.
8.  A window will appear with your **Client ID** and **Client Secret**. Copy both values immediately. The Client Secret cannot be viewed again later.

### Step 3. Store the Client Secret Securely
Never expose your Client Secret. Store it in Google's Secret Manager.

1.  In the Google Cloud Console, click the **Activate Cloud Shell** icon \`[>_]\` in the top-right header. This opens a command-line terminal at the bottom of the page.
2.  In the Cloud Shell terminal, run the following command. Replace \`PASTE_YOUR_CLIENT_SECRET_HERE\` with the actual Client Secret you just copied, and \`[YOUR_HOSTING_PROJECT_ID]\` with your project's ID.
    \`\`\`bash
    echo "PASTE_YOUR_CLIENT_SECRET_HERE" | gcloud secrets create oauth-client-secret --data-file=- --project=[YOUR_HOSTING_PROJECT_ID]
    \`\`\`

### Step 4. Grant the Backend Permission to Read the Secret
Your running application needs permission to read the secret you just stored.

1.  In the same Cloud Shell terminal, find your project's **Compute Engine default service account**. You can find this in the IAM section of the console. It will look like \`[PROJECT_NUMBER]-compute@developer.gserviceaccount.com\`.
2.  Run this command, replacing the member and project placeholders:
    \`\`\`bash
    gcloud secrets add-iam-policy-binding oauth-client-secret \\
      --member="serviceAccount:[PROJECT_NUMBER]-compute@developer.gserviceaccount.com" \\
      --role="roles/secretmanager.secretAccessor" \\
      --project=[YOUR_HOSTING_PROJECT_ID]
    \`\`\`
3.  You will see a confirmation message that the IAM policy was updated.

Congratulations! Your Google Cloud infrastructure is now fully configured.

---

## Phase 2: Instructions for Your End-Users

Your application's documentation must instruct your users to perform these steps in their own Google Cloud projects before they can use your service.

1.  **Provide Project ID:** The user must provide your application with their Google Cloud Project ID where they want to deploy their code.
2.  **Enable APIs:** In *their* project, the user must enable the following APIs:
    *   Cloud Build API
    *   Cloud Run Admin API
    *   Artifact Registry API

### Next Steps: The Application Code
With the infrastructure complete, the next phase is to write your application's backend code to perform the OAuth flow and interact with Google's APIs. Your code must:

*   Redirect users to Google for login using your Client ID.
*   Handle the \`/oauth2/callback\` route.
*   Fetch the Client Secret from Secret Manager at runtime.
*   Exchange the authorization code from Google for a refresh token.
*   Securely store this refresh token in a database (like Firestore), associated with the user.
*   Use the refresh token to get new access tokens when needed to call the Cloud Build and Cloud Run APIs on the user's behalf.
`;
