/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// --- Type Aliases for Clarity ---
export type ConsoleView = 'logs' | 'intro' | 'developer' | 'features' | 'milestone' | 'modelcard' | 'iam' | 'a2a' | 'secrets' | 'build-locations' | 'auth-methods' | 'oauth-clients' | 'privacy' | 'free-ai-service' | 'client-side-auth' | 'self-hosting';
export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';

// --- Data Structures ---
export interface AppNotification {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
}

export interface SuggestedFix {
    filePath: string;
    content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  suggestedFix?: SuggestedFix;
}

export interface Project {
  id: string;
  name: string;
}

export interface CloudRunService {
  id: string;
  name: string;
}

export interface GitHubRepo {
  id: string;
  fullName: string;
}

export interface User {
    email: string;
    name?: string;
    picture?: string; // For displaying avatar
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: Date;
}

export interface EnvironmentVariable {
    key: string;
    value: string;
}

export interface Secret {
    name: string;
    version: string;
    envVarName: string;
}

export interface DeployConfig {
    project: string;
    repoUrl: string;
    deploymentType: 'new' | 'existing';
    serviceName: string;
    existingService: string;
    region: string;
    environmentVariables: EnvironmentVariable[];
    secrets: Secret[];
    minInstances: number;
    maxInstances: number;
    buildStrategy: 'buildpacks' | 'dockerfile';
    dockerfilePath: string;
    enableCI: boolean;
    isAutonomousMode: boolean;
    autonomousAttempts: number;
}


// --- Core App State ---
export type AppState = {
  currentStep: number;
  appNotification: AppNotification | null;
  isCheckingSession: boolean;
  
  // Chat / Assistant State
  isChatOpen: boolean;
  isAssistantLoading: boolean;
  chatMessages: ChatMessage[];
  isAssistantEnabled: boolean;

  // Console State
  consoleView: ConsoleView;

  // Step 1
  googleLoggedIn: boolean;
  googleUser: string;
  isConnectingGoogle: boolean;
  projects: Project[];
  project: string;
  isLoadingProjects: boolean;
  projectsError: string | null;

  githubLoggedIn: boolean;
  githubUser: string;
  isConnectingGithub: boolean;
  repos: GitHubRepo[];
  isLoadingRepos: boolean;
  reposError: string | null;
  selectedRepo: string;

  // Step 2
  deploymentType: 'new' | 'existing';
  serviceName: string;
  region: string;
  existingService: string;
  existingServices: CloudRunService[];
  isLoadingServices: boolean;
  servicesError: string | null;
  buildStrategy: 'buildpacks' | 'dockerfile';
  dockerfilePath: string;
  environmentVariables: EnvironmentVariable[];
  secrets: Secret[];
  minInstances: number;
  maxInstances: number;

  // Step 3
  permissionsGranted: Record<string, boolean>;
  isGranting: boolean;

  // Step 4
  isDeploying: boolean;
  deploymentLogs: LogEntry[];
  deploymentSuccess: boolean;
  deploymentUrl: string | null;
  enableCI: boolean;
  isAutonomousMode: boolean;
  autonomousIterations: number;
  autonomousAttempts: number;
  fixApplied: SuggestedFix | null;
};

// --- Reducer Actions ---
export type Action =
  | { type: 'HYDRATE_STATE'; payload: AppState }
  | { type: 'RESET_STATE' }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'PREVIOUS_STEP' }
  | { type: 'SET_NOTIFICATION'; payload: AppNotification | null }
  
  // Chat / Assistant
  | { type: 'TOGGLE_CHAT' }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_ASSISTANT_LOADING'; payload: boolean }
  
  // Console
  | { type: 'SET_CONSOLE_VIEW'; payload: ConsoleView }
  
  // Session / Auth
  | { type: 'AUTH_STATUS_UPDATE'; payload: { loggedIn: boolean, user?: User, connections?: { google: boolean, github: boolean }, githubUser?: string } }
  | { type: 'START_LOGOUT' }
  | { type: 'LOGOUT_SUCCESS' }
  
  // Google & Projects (Step 1)
  | { type: 'START_GOOGLE_LOGIN' }
  | { type: 'GOOGLE_LOGIN_FAIL' }
  | { type: 'START_PROJECTS_FETCH' }
  | { type: 'PROJECTS_FETCH_SUCCESS'; payload: Project[] }
  | { type: 'PROJECTS_FETCH_FAIL'; payload: string }
  | { type: 'SET_PROJECT'; payload: string }
  
  // GitHub & Repos (Step 1)
  | { type: 'START_GITHUB_LOGIN' }
  | { type: 'GITHUB_LOGIN_SUCCESS'; payload: string }
  | { type: 'GITHUB_LOGIN_FAIL' }
  | { type: 'START_REPO_FETCH' }
  | { type: 'REPO_FETCH_SUCCESS'; payload: GitHubRepo[] }
  | { type: 'REPO_FETCH_FAIL' }
  | { type: 'SET_REPO'; payload: string }
  
  // Configuration (Step 2)
  | { type: 'SET_DEPLOYMENT_CONFIG'; payload: { key: keyof AppState, value: any } }
  | { type: 'START_SERVICES_FETCH' }
  | { type: 'SERVICES_FETCH_SUCCESS'; payload: CloudRunService[] }
  | { type: 'SERVICES_FETCH_FAIL'; payload: string }
  | { type: 'SET_BUILD_STRATEGY'; payload: 'buildpacks' | 'dockerfile' }
  | { type: 'SET_DOCKERFILE_PATH'; payload: string }
  | { type: 'ADD_ENV_VAR' }
  | { type: 'UPDATE_ENV_VAR'; payload: { index: number, key: 'key' | 'value', value: string } }
  | { type: 'REMOVE_ENV_VAR'; payload: number }
  | { type: 'ADD_SECRET' }
  | { type: 'UPDATE_SECRET'; payload: { index: number, key: 'name' | 'version' | 'envVarName', value: string } }
  | { type: 'REMOVE_SECRET'; payload: number }
  | { type: 'SET_SCALING_CONFIG'; payload: { key: 'minInstances' | 'maxInstances', value: number } }
  | { type: 'SET_CI'; payload: boolean }
  | { type: 'SET_AUTONOMOUS_CONFIG'; payload: { key: keyof AppState, value: any } }
  
  // Permissions (Step 3)
  | { type: 'START_GRANTING_PERMISSIONS' }
  | { type: 'GRANT_PERMISSION_SUCCESS'; payload: string }
  | { type: 'GRANT_PERMISSIONS_COMPLETE' }
  | { type: 'GRANT_PERMISSIONS_FAIL' }
  
  // Deployment (Step 4)
  | { type: 'START_DEPLOY' }
  | { type: 'APPEND_DEPLOY_LOG'; payload: LogEntry[] }
  | { type: 'SET_DEPLOYMENT_URL'; payload: string | null }
  | { type: 'DEPLOY_SUCCESS' }
  | { type: 'DEPLOY_FAIL' }
  | { type: 'APPLY_FIX_AND_RETRY'; payload: SuggestedFix };
