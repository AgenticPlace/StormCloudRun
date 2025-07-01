# StormCloudRun Agent Model Card

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
-   **Expert Knowledge Base:** The AI is grounded in extensive documentation on Google Cloud topics. Its knowledge now includes detailed overviews of **The OAuth 2.0 Framework**, **Identity and Access Management (IAM)**, **Google Cloud Authentication Methods**, **Google Cloud Service Agents**, **specific IAM roles for source deployments**, **the `@google-cloud/run` Node.js client library**, **deploying pre-built container images**, **the Secret Manager API**, **gcloud CLI authorization flows**, **Cloud Build pricing**, and **Cloud Build regional configurations**.
-   **Dynamic Log Analysis:** The agent can analyze a stream of real-time deployment logs to identify errors, warnings, and potential improvements. It provides contextual, actionable advice to help developers debug failed deployments quickly.
-   **Autonomous Self-Correction:** When "Autonomous Mode" is enabled, the RAGE system can take the log analysis a step further. It will propose a structured, actionable code fix (e.g., modifying a `requirements.txt` file). With user approval via a single click, the agent applies this fix and re-initiates the deployment, creating an intelligent, self-correcting feedback loop. This process is enhanced by its self-awareness, allowing it to correlate log errors with the actual application code.

## Conceptual API for A2A Interaction

For programmatic use, the StormCloudRun agent would expose a simplified API. See the `a2a.md` guide for the full specification.

## Limitations and Ethical Considerations

-   **Security & Authentication:** The AI assistant is now available for free after a user signs in with their Google account. All AI-related API calls are routed through a secure backend service which uses the **Google Code Assist API**. The frontend client never handles API keys or other secrets.
-   **Data Privacy:** The AI assistant is powered by Google's Code Assist API. As a condition of this free service, **prompts and responses may be used by Google to improve their products.** Users must not submit sensitive or confidential information. A clear privacy notice is displayed in the application, and users agree to these terms by using the assistant.
-   **Scope:** The agent is currently scoped to GitHub and Google Cloud Run. It does not support other source repositories or deployment targets.
-   **"Hallucination" in AI:** While the RAGE capability grounds the AI's analysis in real log data and its own source code, there is always a risk of the generative model providing incorrect or incomplete advice. The autonomous mode requires explicit user approval for any proposed changes to mitigate this risk.
-   **Transparency:** The agent provides real-time feedback on its autonomous actions (e.g., "Analyzing logs...") and transparently reports all applied changes to the user upon successful completion. This is a key feature for maintaining user trust and oversight.
-   **Permissions:** The agent operates with the permissions granted by the user. It is a powerful tool and should be used with caution, as it can make real changes to a user's cloud environment. The UI is designed to be explicit about what permissions it requires and why.
-   **Session Data:** All user state and AI conversation history are isolated and managed on a per-session basis, ensuring that no data is shared between users. State is persisted in the browser's `sessionStorage` and is cleared when the session ends or the user resets the application state.