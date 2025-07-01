
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { initialState, appReducer } from './state/reducer';
import { config, api } from './api';
import type { AppState, LogEntry, SuggestedFix, ConsoleView, ChatMessage } from './state/types';
import { fullAppCodeContext } from './context';
import WizardProgress from './components/WizardProgress';
import Step1Connect from './components/Step1Connect';
import Step2Configure from './components/Step2Configure';
import Step3Permissions from './components/Step3Permissions';
import Step4Deploy from './components/Step4Deploy';
import Notification from './components/Notification';
import ChatWidget from './components/ChatWidget';
import PersistentConsole from './components/PersistentConsole';

const SESSION_STORAGE_KEY = 'stormCloudRunSession';

// This initializer function runs once when the reducer is created
const init = (initialState: AppState): AppState => {
  try {
    const storedState = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (storedState) {
      const parsedState = JSON.parse(storedState);
      // We return a hydrated state but ensure certain transient properties are reset
      return {
          ...parsedState,
          isCheckingSession: true, // Always check session on load
          isDeploying: false,
          isGranting: false,
          isConnectingGoogle: false,
          isConnectingGithub: false,
          isAssistantLoading: false,
          appNotification: null,
          // Auth state will be determined by the backend session check
          googleLoggedIn: false,
          googleUser: '',
      };
    }
  } catch (e) {
    console.error("Could not parse session state:", e);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
  return initialState;
};


const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState, init);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const appRef = useRef<HTMLDivElement>(null);

  // Persist state to session storage on every change
  useEffect(() => {
    try {
        const stateToSave = { ...state, isCheckingSession: false }; // Don't persist loading states
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Could not save session state:", e);
    }
  }, [state]);


  // Auto-dismiss notifications
  useEffect(() => {
    if (state.appNotification) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.appNotification]);

  const handleApiError = useCallback((error: unknown, overrideMessage?: string) => {
    const message = overrideMessage || (error instanceof Error ? error.message : 'An unknown error occurred.');
    dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message } });
    console.error(error);
  }, [dispatch]);

  // Check authentication status with the backend on initial load
  useEffect(() => {
    const checkAuth = async () => {
        // Check for an error from the OAuth redirect
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('error')) {
            handleApiError(new Error('Authentication failed. Please try again.'));
            // Clean the URL
            history.replaceState({}, document.title, window.location.pathname);
        }

        try {
            const authStatus = await api.auth.checkStatus();
            dispatch({ type: 'AUTH_STATUS_UPDATE', payload: authStatus });
        } catch (error) {
            handleApiError(error, "Could not connect to the backend service.");
            dispatch({ type: 'AUTH_STATUS_UPDATE', payload: { loggedIn: false } });
        }
    };
    if (state.isCheckingSession) {
        checkAuth();
    }
  // NOTE: This should only run when isCheckingSession is true.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isCheckingSession]);

  // Mouse-follow spotlight effect
  useEffect(() => {
    const appElement = appRef.current;
    if (!appElement) return;

    const handleMouseMove = (e: MouseEvent) => {
        const rect = appElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        appElement.style.setProperty('--mouse-x', `${x}px`);
        appElement.style.setProperty('--mouse-y', `${y}px`);
    };

    appElement.addEventListener('mousemove', handleMouseMove);

    return () => {
        appElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleUserQuery = useCallback((query: string) => {
    if (!query.trim()) return;

    if (!state.isAssistantEnabled) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: 'Please sign in with Google to use the AI assistant.' } });
        return;
    }

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'user', content: query } });
    dispatch({ type: 'SET_ASSISTANT_LOADING', payload: true });
  }, [dispatch, state.isAssistantEnabled]);

  // This effect runs when chatMessages changes and the assistant needs to respond.
  useEffect(() => {
    const lastMessage = state.chatMessages[state.chatMessages.length - 1];
    // Only run if the last message is from the user, and we're currently in a loading state.
    if (lastMessage && lastMessage.role === 'user' && state.isAssistantLoading) {
        if (!state.isAssistantEnabled) { // Safety check
            dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: 'The AI assistant is disabled. Please sign in with Google.' } });
            dispatch({ type: 'SET_ASSISTANT_LOADING', payload: false });
            return;
        }

        const getAssistantResponse = async () => {
            try {
                const responseText = await api.assistant.chat(state.chatMessages, fullAppCodeContext);
                
                try {
                    const parsed = JSON.parse(responseText);
                    if (parsed.explanation) {
                        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: parsed.explanation, suggestedFix: parsed.suggestedFix } });
                    } else {
                        // This case handles if the parsed JSON doesn't have the expected 'explanation' field.
                        dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: responseText } });
                    }
                } catch(e) {
                    // This case handles if the responseText is not a valid JSON string.
                    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: responseText } });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
                dispatch({ type: 'ADD_CHAT_MESSAGE', payload: { role: 'assistant', content: `Error: ${errorMessage}` } });
            } finally {
                dispatch({ type: 'SET_ASSISTANT_LOADING', payload: false });
            }
        };
        getAssistantResponse();
    }
  }, [state.chatMessages, state.isAssistantLoading, state.isAssistantEnabled, dispatch]);

    const handleDeploy = async () => {
        if (!state.googleLoggedIn) {
            handleApiError(new Error("Not authenticated with Google. Cannot deploy."));
            return;
        }
        dispatch({ type: 'START_DEPLOY' });
        try {
          const deployConfig = {
            project: state.project, 
            repoUrl: state.selectedRepo, 
            deploymentType: state.deploymentType, 
            serviceName: state.serviceName, 
            existingService: state.existingService, 
            region: state.region,
            environmentVariables: state.environmentVariables,
            secrets: state.secrets,
            minInstances: state.minInstances,
            maxInstances: state.maxInstances,
            buildStrategy: state.buildStrategy,
            dockerfilePath: state.dockerfilePath,
            enableCI: state.enableCI,
            isAutonomousMode: state.isAutonomousMode,
            autonomousAttempts: state.autonomousAttempts,
          };
          const finalLogs: LogEntry[] = [];
          for await (const logBatch of api.google.deploy(deployConfig)) {
            dispatch({ type: 'APPEND_DEPLOY_LOG', payload: logBatch });
            finalLogs.push(...logBatch);
          }

          if (finalLogs.some(l => l.level === 'ERROR')) {
             dispatch({ type: 'DEPLOY_FAIL' });
          } else {
             const successLog = finalLogs.find(l => l.level === 'SUCCESS' && l.message.includes('Service deployed successfully'));
             if (successLog) {
                const urlMatch = successLog.message.match(/URL: (https?:\/\/[^\s]+)/);
                if (urlMatch && urlMatch[1]) {
                    dispatch({ type: 'SET_DEPLOYMENT_URL', payload: urlMatch[1] });
                }
             }
             dispatch({ type: 'DEPLOY_SUCCESS' });
          }
    
        } catch (error) {
          handleApiError(error);
          dispatch({ type: 'DEPLOY_FAIL' });
        }
    };

  const handleLogAnalysis = useCallback((logs: LogEntry[]) => {
    const formattedLogs = logs.map(log => `[${log.timestamp.toISOString()}] [${log.level}] ${log.message}`).join('\n');
    const devOpsQuery = `---DEVOPS EXPERT MODE---\nAnalyze the following deployment log for errors, warnings, or potential improvements. If an error is found, provide a concise explanation and a structured JSON object with a 'suggestedFix' containing a 'filePath' and the corrected file 'content'.\n\n---DEPLOYMENT LOG---\n${formattedLogs}`;
    
    handleUserQuery(devOpsQuery);
    
    if (!state.isChatOpen) {
        dispatch({ type: 'TOGGLE_CHAT' });
    }
  }, [handleUserQuery, state.isChatOpen, dispatch]);

  const handleApplyFix = (fix: SuggestedFix) => {
    dispatch({
        type: 'APPEND_DEPLOY_LOG',
        payload: [{
            level: 'INFO',
            message: `Applying AI suggested fix for ${fix.filePath}...`,
            timestamp: new Date()
        }]
    });
    dispatch({ type: 'APPLY_FIX_AND_RETRY', payload: fix});
  };

  const getLogoPowerClass = () => {
    if (state.deploymentSuccess) return 'power-level-success';
    if (state.isDeploying) return 'power-level-deploying';
    return `power-level-${state.currentStep}`;
  };

  const isChatTrigger = isLogoHovered || state.isChatOpen;
  const rightIcon = isChatTrigger ? 'smart_toy' : 'cloud_upload';
  const isReadyToDeploy = state.currentStep === 4 && !state.isDeploying && !state.deploymentSuccess;

  const steps = [
    <Step1Connect state={state} dispatch={dispatch} handleApiError={handleApiError} />,
    <Step2Configure state={state} dispatch={dispatch} />,
    <Step3Permissions state={state} dispatch={dispatch} handleApiError={handleApiError} />,
    <Step4Deploy state={state} dispatch={dispatch} handleApiError={handleApiError} onAnalyzeLogs={handleLogAnalysis} onDeploy={handleDeploy} />,
  ];

  const handleShowMarkdown = (view: ConsoleView) => {
    dispatch({ type: 'SET_CONSOLE_VIEW', payload: view });
  };

  if (state.isCheckingSession) {
      return (
          <div className="stormcloud-app" style={{justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
              <div className="spinner-wrapper">
                  <div className="spinner" style={{width: '40px', height: '40px'}}></div>
                  <h2>Verifying session...</h2>
              </div>
          </div>
      );
  }

  return (
    <div className="stormcloud-app" ref={appRef}>
      <div className="mouse-spotlight"></div>
      <header>
        <h1 
            className={`logo ${getLogoPowerClass()}`}
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
        >
          <span className="material-symbols-outlined logo-icon-left" aria-label="Deployment status indicator">bolt</span>
          StormCloudRun
          <span 
            className={`material-symbols-outlined logo-icon-right ${isChatTrigger ? 'chat-trigger' : ''} ${isReadyToDeploy ? 'ready-to-deploy' : ''}`}
            onClick={isChatTrigger ? () => dispatch({ type: 'TOGGLE_CHAT' }) : undefined}
            aria-label={isChatTrigger ? "Open AI assistant" : "Cloud deployment icon"}
          >
              {rightIcon}
          </span>
        </h1>
        <p>Deploy your GitHub source code to Google Cloud Run</p>
      </header>
      
      <WizardProgress currentStep={state.currentStep} />

      <div className="dev-status-banner">
        {config.useMockApi ? (
            <><span className="material-symbols-outlined">psychology</span> Using <strong>MOCK API</strong>. No real deployment will occur.</>
        ) : (
            <><span className="material-symbols-outlined">dns</span> Using <strong>BACKEND API</strong>. All auth and API calls are proxied.</>
        )}
      </div>

      <Notification notification={state.appNotification} onDismiss={() => dispatch({ type: 'SET_NOTIFICATION', payload: null })} />
      
      <main className="wizard-step-content">
        {steps[state.currentStep - 1]}
      </main>
      
      <ChatWidget 
        isOpen={state.isChatOpen} 
        onClose={() => dispatch({ type: 'TOGGLE_CHAT' })}
        messages={state.chatMessages}
        isLoading={state.isAssistantLoading}
        onQuery={handleUserQuery}
        onApplyFix={handleApplyFix}
        isAssistantEnabled={state.isAssistantEnabled}
      />

      <PersistentConsole 
        view={state.consoleView}
        logs={state.deploymentLogs}
        onAnalyze={handleLogAnalysis}
        dispatch={dispatch}
      />

      <footer className="app-footer">
        <div className="footer-links">
          {/* Core Concepts */}
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("intro")}}>Intro</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("features")}}>Features</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("milestone")}}>Milestones</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("modelcard")}}>Model Card</a>
          {/* Dev Guides */}
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("developer")}}>Dev Guide</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("self-hosting")}}>Self-Hosting</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("a2a")}}>A2A Guide</a>
          {/* Tech Docs */}
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("auth-methods")}}>Auth Methods</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("oauth-clients")}}>OAuth Clients</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("client-side-auth")}}>Client Auth</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("iam")}}>IAM Guide</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("secrets")}}>Secrets Guide</a>
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("build-locations")}}>Build Locations</a>
          {/* AI/Legal */}
          
          <a href="#" onClick={(e) => { e.preventDefault(); handleShowMarkdown("privacy")}}>Privacy</a>
        </div>
        StormCloudRun v0.9.2 :: Augmentic Intelligence &copy; MINDX 2025 :: Apache 2.0
      </footer>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
