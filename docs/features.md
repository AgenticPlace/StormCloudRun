
# StormCloudRun: Key Features

StormCloudRun is more than just a deployment tool; it's an intelligent, developer-centric platform designed to make shipping code to Google Cloud Run a seamless and powerful experience.

### 1. Guided Deployment Wizard
The core of the application is a clean, step-by-step wizard that guides you through the entire deployment process. From connecting your accounts to configuring your service, each step is designed to be clear, intuitive, and focused, eliminating guesswork and reducing the cognitive load of a complex deployment.

### 2. Intelligent & Flexible Configuration
-   **Build Strategy:** Choose between Google Cloud's automatic **Buildpacks** for a zero-config experience (recommended) or specify the path to a custom **`Dockerfile`** for complete control over your container image.
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
-   **Actionable Code Fixes:** The assistant doesn't just give advice; it generates a structured code fix (e.g., adding a missing dependency to `requirements.txt`).
-   **One-Click Retry:** With a single click, you can apply the suggested fix and retry the deployment, turning a frustrating failure into a learning opportunity and a successful deployment.

### 5. One-Click Continuous Deployment (CI/CD)
With a single toggle switch, you can enable Continuous Deployment. When activated, StormCloudRun will automatically configure a Cloud Build trigger that watches your GitHub repository. Any new commit pushed to your main branch will automatically be built and deployed, creating a full CI/CD pipeline instantly.

### 6. Live, Structured Deployment Console
Monitor your deployment in real-time with a professional-grade console.
-   **Live Log Streaming:** Watch the build and deployment process unfold with a live stream of logs directly from the backend.
-   **Structured & Color-Coded:** Logs are structured and color-coded by severity (Info, Success, Warning, Error) for easy scanning and debugging.

### 7. Secure by Design
The entire application is architected with security as a top priority. The frontend UI never handles sensitive credentials. All authentication and API calls to cloud providers are managed by a secure backend service, ensuring your tokens and keys remain protected.
