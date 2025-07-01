/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type { Project, CloudRunService, GitHubRepo, DeployConfig, User, LogEntry, EnvironmentVariable, Secret, ChatMessage } from './state/types';

// --- App Configuration ---
export const config = {
  // SET TO `false` TO USE THE REAL BACKEND API.
  useMockApi: false, 
  // The base URL for the real backend API.
  apiBaseUrl: 'http://localhost:8080',
};

// --- API Helper for simple JSON responses ---
const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
    const defaultOptions: RequestInit = {
        credentials: 'include', // Important for sending session cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred.');
    }
    // Handle case where logout might not return a body
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return {};
};

// --- API Helper for streaming responses ---
const streamFetchWithCredentials = async function* (url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'A streaming API error occurred.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            if (buffer.trim().length > 0) {
                try { yield JSON.parse(buffer); } catch (e) { console.error("Failed to parse final chunk:", buffer, e); }
            }
            break;
        }
        buffer += decoder.decode(value, { stream: true });
        
        const parts = buffer.split('\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
            if (part.trim()) {
                try { yield JSON.parse(part); } catch (e) { console.error("Failed to parse stream part:", part, e); }
            }
        }
    }
};


// --- API Interfaces ---

interface AuthApi {
    checkStatus(): Promise<{ loggedIn: boolean; user?: User }>;
    login(): void;
    logout(): Promise<void>;
}

interface GoogleCloudApi {
    getProjects(): Promise<Project[]>;
    getCloudRunServices(projectId: string, region: string): Promise<CloudRunService[]>;
    grantPermissions(permissions: string[]): AsyncGenerator<string>;
    deploy(config: DeployConfig): AsyncGenerator<LogEntry[]>;
}

interface GitHubApi {
    login(): void;
    getRepos(): Promise<GitHubRepo[]>;
}

interface AssistantApi {
    chat(history: ChatMessage[], fullContext: string): Promise<string>;
}

// --- Real API Layer (Proxied through backend) ---
const realApi = {
    auth: {
        checkStatus: async (): Promise<{ loggedIn: boolean; user?: User }> => {
            return await fetchWithCredentials(`${config.apiBaseUrl}/api/auth/me`);
        },
        login: (): void => {
            window.location.href = `${config.apiBaseUrl}/api/auth/google`;
        },
        logout: async (): Promise<void> => {
            await fetchWithCredentials(`${config.apiBaseUrl}/api/auth/logout`, { method: 'POST' });
        }
    },
    google: {
      getProjects: async (): Promise<Project[]> => {
        const data = await fetchWithCredentials(`${config.apiBaseUrl}/api/google/projects`);
        return data.projects || [];
      },
      getCloudRunServices: async (projectId: string, region: string): Promise<CloudRunService[]> => {
        if (!projectId || !region) return [];
        const data = await fetchWithCredentials(`${config.apiBaseUrl}/api/google/services?projectId=${projectId}&region=${region}`);
        return data.services || [];
      },
      grantPermissions: async function* (permissions: string[]): AsyncGenerator<string> {
         const body = JSON.stringify({ permissions });
         for await (const chunk of streamFetchWithCredentials(
             `${config.apiBaseUrl}/api/google/permissions`, 
             { method: 'POST', body }
         )) {
             if (chunk.granted) {
                 yield chunk.granted;
             }
         }
      },
      deploy: async function* (deployConfig: DeployConfig): AsyncGenerator<LogEntry[]> {
        const body = JSON.stringify(deployConfig);
        yield* streamFetchWithCredentials(
            `${config.apiBaseUrl}/api/google/deploy`,
            { method: 'POST', body }
        ) as AsyncGenerator<LogEntry[]>;
      }
    },
    github: {
        login: (): void => {
            window.location.href = `${config.apiBaseUrl}/api/auth/github`;
        },
        getRepos: async (): Promise<GitHubRepo[]> => {
            return await fetchWithCredentials(`${config.apiBaseUrl}/api/github/repos`);
        }
    },
    assistant: {
        chat: async (history: ChatMessage[], fullContext: string): Promise<string> => {
            const data = await fetchWithCredentials(`${config.apiBaseUrl}/api/assistant/chat`, {
                method: 'POST',
                body: JSON.stringify({ history, context: fullContext }),
            });
            return data.response;
        }
    },
};

// --- Mock API Layer (for fallback and development) ---
const mockApi = {
    auth: {
        checkStatus: async (): Promise<{ loggedIn: boolean; user?: User }> => {
            await new Promise(resolve => setTimeout(resolve, 300));
            return { loggedIn: false };
        },
        login: (): void => {
            console.log("Mock login initiated.");
        },
        logout: async (): Promise<void> => {
            console.log("Mock logout initiated.");
        }
    },
    google: {
      getProjects: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
          { id: 'my-cool-project-31337', name: 'my-cool-project-31337' },
          { id: 'agentic-place-pythai', name: 'agentic-place-pythai' },
          { id: 'internal-demo-project', name: 'internal-demo-project' },
        ];
      },
      getCloudRunServices: async (projectId: string, region: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        if (!projectId || !region) return [];
        if (projectId === 'agentic-place-pythai') {
            return [{ id: 'agenticplace-pythai-svc', name: 'agenticplace-pythai-svc' }];
        }
        return [
            { id: 'frontend-prod', name: 'frontend-prod' },
            { id: 'backend-api-v2', name: 'backend-api-v2' },
            { id: 'data-processor', name: 'data-processor' },
        ];
      },
      grantPermissions: async function* (permissions: string[]) {
        for (const perm of permissions) {
            await new Promise(resolve => setTimeout(resolve, 800));
            yield perm;
        }
      },
      deploy: async function* (deployConfig: DeployConfig): AsyncGenerator<LogEntry[]> {
         const logs: LogEntry[] = [
            { level: 'INFO', message: `Triggering Cloud Build for repository ${deployConfig.repoUrl}`, timestamp: new Date() },
            { level: 'INFO', message: `Using build strategy: ${deployConfig.buildStrategy}${deployConfig.buildStrategy === 'dockerfile' ? ` (Path: ${deployConfig.dockerfilePath})` : ''}`, timestamp: new Date() },
            { level: 'SUCCESS', message: `${deployConfig.environmentVariables.length} environment variables and ${deployConfig.secrets.length} secrets configured.`, timestamp: new Date() },
            { level: 'SUCCESS', message: `Scaling configured: Min Instances=${deployConfig.minInstances}, Max Instances=${deployConfig.maxInstances}.`, timestamp: new Date() },
            { level: 'INFO', message: `Starting build... (Attempt ${deployConfig.autonomousAttempts + 1})`, timestamp: new Date() },
            { level: 'INFO', message: `Building container image...`, timestamp: new Date() },
         ];
         yield logs;
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         if (deployConfig.autonomousAttempts === 0 && deployConfig.isAutonomousMode) {
            const errorLog: LogEntry[] = [{ level: 'ERROR', message: `Build failed: 'gunicorn' command not found. Procfile may be misconfigured.`, timestamp: new Date() }];
            yield errorLog;
            return;
         }

         const pushLog: LogEntry[] = [{ level: 'SUCCESS', message: `Pushing image to artifactregistry.com/${deployConfig.project}/cloud-run-source-deploy/...`, timestamp: new Date() }];
         yield pushLog;
         await new Promise(resolve => setTimeout(resolve, 1500));
         
         const deployLog: LogEntry[] = [{ level: 'INFO', message: `Deploying service to Cloud Run...`, timestamp: new Date() }];
         yield deployLog;
         await new Promise(resolve => setTimeout(resolve, 1500));

         const successLog: LogEntry[] = [{ level: 'SUCCESS', message: `Service deployed successfully. URL: https://${deployConfig.deploymentType === 'new' ? deployConfig.serviceName : deployConfig.existingService}-117975713968.${deployConfig.region}.run.app`, timestamp: new Date() }];
         yield successLog;

         if (deployConfig.enableCI) {
            const ciLog1: LogEntry[] = [{ level: 'INFO', message: 'Continuous Deployment enabled. Creating Cloud Build trigger...', timestamp: new Date() }];
            yield ciLog1;
            await new Promise(resolve => setTimeout(resolve, 800));
            const ciLog2: LogEntry[] = [{ level: 'SUCCESS', message: 'Cloud Build trigger created successfully.', timestamp: new Date() }];
            yield ciLog2;
         }
      }
    },
    github: {
        login: () => {
            console.log("Mock GitHub login initiated.");
        },
        getRepos: async () => {
            await new Promise(resolve => setTimeout(resolve, 1200));
            return [
                { id: '123', fullName: 'storm-cloud-dev/personal-website' },
                { id: '456', fullName: 'storm-cloud-dev/dotfiles' },
                { id: '789', fullName: 'storm-cloud-dev/advent-of-code-2023' },
            ];
        }
    },
    assistant: {
        chat: async (history: ChatMessage[], _fullContext: string): Promise<string> => {
            await new Promise(resolve => setTimeout(resolve, 1200));
            const lastUserMessage = [...history].reverse().find(m => m.role === 'user');
            if (lastUserMessage && lastUserMessage.content.includes('---DEVOPS EXPERT MODE---')) {
                const fix = {
                    filePath: 'Procfile',
                    content: 'web: gunicorn --bind 0.0.0.0:$PORT main:app'
                };
                const explanation = "The error 'gunicorn command not found' suggests the web process in your Procfile is misconfigured. I've corrected it to use a standard gunicorn command.";
                return JSON.stringify({ explanation, suggestedFix: fix });
            }
            return "This is a mock response from the assistant. In a real environment, I would provide a more detailed answer based on your question about StormCloudRun.";
        }
    },
};

const selectedApi: {
    auth: AuthApi;
    google: GoogleCloudApi;
    github: GitHubApi;
    assistant: AssistantApi;
} = config.useMockApi ? mockApi : realApi;

export const api = {
    ...selectedApi,
    config: config,
};

// Re-export types for convenience
export type { Project, CloudRunService, GitHubRepo, DeployConfig, User, LogEntry, EnvironmentVariable, Secret };