/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { AppState, Action } from './types';

const SESSION_STORAGE_KEY = 'stormCloudRunSession';

export const initialState: AppState = {
  currentStep: 1,
  appNotification: null,
  isCheckingSession: true, // Start in checking state
  isChatOpen: false,
  isAssistantLoading: false,
  chatMessages: [],
  isAssistantEnabled: false,
  consoleView: 'logs',
  googleLoggedIn: false,
  googleUser: '',
  isConnectingGoogle: false,
  projects: [],
  project: '',
  isLoadingProjects: false,
  projectsError: null,
  githubLoggedIn: false,
  githubUser: '',
  isConnectingGithub: false,
  repos: [],
  isLoadingRepos: false,
  reposError: null,
  selectedRepo: '',
  deploymentType: 'new',
  serviceName: '',
  region: 'us-west1',
  existingService: '',
  existingServices: [],
  isLoadingServices: false,
  servicesError: null,
  buildStrategy: 'buildpacks',
  dockerfilePath: './Dockerfile',
  environmentVariables: [],
  secrets: [],
  minInstances: 0,
  maxInstances: 0,
  permissionsGranted: {},
  isGranting: false,
  isDeploying: false,
  deploymentLogs: [],
  deploymentUrl: null,
  deploymentSuccess: false,
  enableCI: false,
  isAutonomousMode: false,
  autonomousIterations: 3,
  autonomousAttempts: 0,
  fixApplied: null,
};

function stopAllLoaders(state: AppState): AppState {
    return {
        ...state,
        isConnectingGoogle: false,
        isConnectingGithub: false,
        isLoadingRepos: false,
        isLoadingServices: false,
        isLoadingProjects: false,
        isGranting: false,
        isDeploying: false,
    };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE_STATE': return action.payload;
    case 'SET_STEP': return { ...state, currentStep: action.payload };
    case 'PREVIOUS_STEP': return { ...state, currentStep: Math.max(1, state.currentStep - 1) };
    case 'SET_NOTIFICATION': return { ...state, appNotification: action.payload };
    case 'TOGGLE_CHAT': return { ...state, isChatOpen: !state.isChatOpen };
    case 'ADD_CHAT_MESSAGE': return { ...state, chatMessages: [...state.chatMessages, action.payload] };
    case 'SET_ASSISTANT_LOADING': return { ...state, isAssistantLoading: action.payload };
    case 'SET_CONSOLE_VIEW': return { ...state, consoleView: action.payload };
    
    // Session Management & Auth
    case 'AUTH_STATUS_UPDATE': {
        const { loggedIn, user, connections, githubUser } = action.payload;
        return {
            ...state,
            isCheckingSession: false,
            googleLoggedIn: loggedIn && !!connections?.google,
            githubLoggedIn: loggedIn && !!connections?.github,
            googleUser: user?.email || '',
            githubUser: githubUser || '',
            isAssistantEnabled: loggedIn && !!connections?.google,
            // Automatically advance past step 1 if both accounts are connected
            currentStep: (loggedIn && connections?.google && connections?.github && state.currentStep === 1) ? 2 : state.currentStep,
        };
    }
    case 'START_LOGOUT': return { ...state, isConnectingGoogle: true }; // Re-use the spinner
    case 'LOGOUT_SUCCESS':
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return {
            ...initialState, // A full reset on logout
            isCheckingSession: false,
        };
    
    // Google Login
    case 'START_GOOGLE_LOGIN': return { ...state, isConnectingGoogle: true, appNotification: null };
    case 'GOOGLE_LOGIN_FAIL': return { ...stopAllLoaders(state), googleLoggedIn: false, isAssistantEnabled: false };

    // Project Fetching
    case 'START_PROJECTS_FETCH': return { ...state, isLoadingProjects: true, projectsError: null, projects: [] };
    case 'PROJECTS_FETCH_SUCCESS': return { ...state, isLoadingProjects: false, projects: action.payload };
    case 'PROJECTS_FETCH_FAIL': return { ...state, isLoadingProjects: false, projectsError: action.payload, projects: [] };
    case 'SET_PROJECT': return { ...state, project: action.payload, existingService: '', servicesError: null };
    
    // GitHub Login & Repo Fetching
    case 'START_GITHUB_LOGIN': return { ...state, isConnectingGithub: true, appNotification: null };
    case 'GITHUB_LOGIN_SUCCESS': return { ...state, isConnectingGithub: false, githubLoggedIn: true, githubUser: action.payload, appNotification: { type: 'success', message: `Logged in as ${action.payload}` } };
    case 'GITHUB_LOGIN_FAIL': return { ...stopAllLoaders(state), githubLoggedIn: false };
    case 'START_REPO_FETCH': return { ...state, isLoadingRepos: true, reposError: null, repos: [] };
    case 'REPO_FETCH_SUCCESS': return { ...state, isLoadingRepos: false, repos: action.payload };
    case 'REPO_FETCH_FAIL': return { ...stopAllLoaders(state), repos: [] };
    case 'SET_REPO': return { ...state, selectedRepo: action.payload };
    
    // Step 2
    case 'SET_DEPLOYMENT_CONFIG': return { ...state, [action.payload.key]: action.payload.value };
    case 'START_SERVICES_FETCH': return { ...state, isLoadingServices: true, servicesError: null, existingServices: [], existingService: '' };
    case 'SERVICES_FETCH_SUCCESS': return { ...state, isLoadingServices: false, existingServices: action.payload };
    case 'SERVICES_FETCH_FAIL': return { ...state, isLoadingServices: false, servicesError: action.payload };
    case 'SET_BUILD_STRATEGY': return { ...state, buildStrategy: action.payload };
    case 'SET_DOCKERFILE_PATH': return { ...state, dockerfilePath: action.payload };
    case 'SET_CI': return { ...state, enableCI: action.payload };
    case 'SET_AUTONOMOUS_CONFIG': return { ...state, [action.payload.key]: action.payload.value };
    case 'ADD_ENV_VAR': return { ...state, environmentVariables: [...state.environmentVariables, { key: '', value: '' }] };
    case 'UPDATE_ENV_VAR': {
        const newVars = [...state.environmentVariables];
        newVars[action.payload.index] = { ...newVars[action.payload.index], [action.payload.key]: action.payload.value };
        return { ...state, environmentVariables: newVars };
    }
    case 'REMOVE_ENV_VAR': return { ...state, environmentVariables: state.environmentVariables.filter((_, i) => i !== action.payload) };
    case 'ADD_SECRET': return { ...state, secrets: [...state.secrets, { name: '', version: 'latest', envVarName: '' }] };
    case 'UPDATE_SECRET': {
        const newSecrets = [...state.secrets];
        newSecrets[action.payload.index] = { ...newSecrets[action.payload.index], [action.payload.key]: action.payload.value };
        return { ...state, secrets: newSecrets };
    }
    case 'REMOVE_SECRET': return { ...state, secrets: state.secrets.filter((_, i) => i !== action.payload) };
    case 'SET_SCALING_CONFIG': return { ...state, [action.payload.key]: Math.max(0, action.payload.value) };
    
    // Step 3
    case 'START_GRANTING_PERMISSIONS': return { ...state, isGranting: true, appNotification: null };
    case 'GRANT_PERMISSION_SUCCESS': return { ...state, permissionsGranted: { ...state.permissionsGranted, [action.payload]: true } };
    case 'GRANT_PERMISSIONS_COMPLETE': return { ...state, isGranting: false };
    case 'GRANT_PERMISSIONS_FAIL': return { ...stopAllLoaders(state) };

    // Step 4
    case 'START_DEPLOY': return { ...state, isDeploying: true, deploymentLogs: [], appNotification: null, deploymentSuccess: false, deploymentUrl: null, consoleView: 'logs' };
    case 'APPEND_DEPLOY_LOG': return { ...state, deploymentLogs: [...state.deploymentLogs, ...action.payload] };
    case 'SET_DEPLOYMENT_URL': return { ...state, deploymentUrl: action.payload };
    case 'DEPLOY_SUCCESS': return { ...state, isDeploying: false, deploymentSuccess: true };
    case 'DEPLOY_FAIL': return { ...stopAllLoaders(state) };
    case 'APPLY_FIX_AND_RETRY': return {
        ...state,
        fixApplied: action.payload,
        currentStep: 4,
        isDeploying: false,
        deploymentSuccess: false,
        deploymentLogs: [],
        autonomousAttempts: state.autonomousAttempts + 1,
        appNotification: { type: 'info', message: `Applying fix for ${action.payload.filePath} and retrying deployment.` },
    };
    case 'RESET_STATE':
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        // This creates a new session but persists key information like logins and chat history
        // so the user can start a new deployment without logging in again.
        return {
            ...initialState,
            isCheckingSession: false, 
            googleLoggedIn: state.googleLoggedIn,
            googleUser: state.googleUser,
            githubLoggedIn: state.githubLoggedIn,
            githubUser: state.githubUser,
            projects: state.projects,
            repos: state.repos,
            isAssistantEnabled: state.googleLoggedIn,
            isChatOpen: state.isChatOpen,
            chatMessages: state.chatMessages,
        };
    default: return state;
  }
}
