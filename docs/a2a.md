# StormCloudRun Agent-to-Agent (A2A) API Specification

## 1. Overview

This document outlines the conceptual API for programmatically interacting with the StormCloudRun agent. This API is designed for automated systems, such as CI/CD pipelines, project scaffolding tools, or other AI agents, to trigger and manage deployments without direct human interaction through the UI.

The core principle is to provide a single, powerful endpoint that accepts a comprehensive deployment configuration and returns a stream of structured logs, culminating in a final status.

## 2. Authentication

The A2A API assumes the calling agent has already obtained the necessary OAuth 2.0 access tokens for both Google Cloud and GitHub. These tokens must be passed in the request payload. The StormCloudRun backend will then use these tokens to perform actions on behalf of the user.

-   **Google Cloud Token:** Must have scopes for Resource Manager, Cloud Build, Cloud Run, Service Usage, and IAM.
-   **GitHub Token:** Must have scopes for reading repository content (`repo`). If the autonomous mode needs to push fixes, it will require write access (`repo`).

## 3. The `deploy` Endpoint

This is the primary endpoint for all A2A interactions.

**`POST /api/agent/deploy`**

### 3.1. Request Body

The request body is a JSON object with the following structure:

```json
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
```

### 3.2. Field Descriptions

| Path                                    | Type      | Required | Description                                                                                                                                                             |
| --------------------------------------- | --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `google_credentials.oauth_access_token` | `string`  | Yes      | The user's Google Cloud OAuth 2.0 access token.                                                                                                                         |
| `github_credentials.oauth_access_token` | `string`  | Yes      | The user's GitHub OAuth 2.0 access token.                                                                                                                               |
| `project_id`                            | `string`  | Yes      | The target Google Cloud Project ID.                                                                                                                                     |
| `github_repo_url`                       | `string`  | Yes      | The full URL of the GitHub repository to deploy.                                                                                                                        |
| `deployment_config`                     | `object`  | Yes      | Container for all service configuration details.                                                                                                                        |
| `deployment_config.target`              | `string`  | Yes      | Either `"new_service"` or `"existing_service"`.                                                                                                                         |
| `deployment_config.service_name`        | `string`  | Yes if new | The name for the new Cloud Run service. Must be unique.                                                                                                                 |
| `deployment_config.existing_service_id` | `string`  | Yes if existing | The ID of the existing Cloud Run service to deploy to.                                                                                                           |
| `deployment_config.region`              | `string`  | Yes      | The Google Cloud region for the deployment (e.g., "us-central1").                                                                                                       |
| `deployment_config.build_strategy`      | `string`  | No       | Either `"buildpacks"` (default) or `"dockerfile"`.                                                                                                                      |
| `deployment_config.dockerfile_path`     | `string`  | No       | The path to the Dockerfile within the repository, if using that strategy. Defaults to `./Dockerfile`.                                                                    |
| `deployment_config.environment_variables` | `array`   | No       | An array of `{ "key": "string", "value": "string" }` objects.                                                                                                           |
| `deployment_config.secrets`             | `array`   | No       | An array of `{ "name": "string", "version": "string", "envVarName": "string" }` objects.                                                                                |
| `deployment_config.scaling`             | `object`  | No       | An object with `{ "min_instances": number, "max_instances": number }`.                                                                                                  |
| `options`                               | `object`  | No       | Container for automation options.                                                                                                                                       |
| `options.enable_ci`                     | `boolean` | No       | If `true`, a Cloud Build trigger will be created for CI/CD. Defaults to `false`.                                                                                        |
| `options.autonomous_mode`               | `object`  | No       | Configuration for the self-correction feature.                                                                                                                          |
| `options.autonomous_mode.enabled`       | `boolean` | No       | If `true`, the agent will attempt to fix build errors. Defaults to `false`.                                                                                               |
| `options.autonomous_mode.max_iterations`| `number`  | No       | The maximum number of fix-and-retry attempts. Defaults to `3`.                                                                                                          |

### 3.4. Response

The API will respond with a `200 OK` status and a streaming response body (`Content-Type: application/x-ndjson`). Each line of the response will be a JSON object representing a batch of structured log entries.

**Log Entry Format:**

```json
[
  {
    "timestamp": "2025-08-01T14:30:05.123Z",
    "level": "INFO",
    "message": "Starting build..."
  }
]
```

The final log entry in the stream will have a `level` of `"SUCCESS"` or `"ERROR"` and will contain the final status. If successful, the message will include the live URL of the deployed service.

**Example Final Success Log:**
```json
[
  {
    "timestamp": "2025-08-01T14:35:10.456Z",
    "level": "SUCCESS",
    "message": "Service deployed successfully. URL: https://my-new-app-from-api-117975713968.us-central1.run.app"
  }
]
```

This streaming, structured response allows the calling agent to provide real-time feedback to its own users or systems.
