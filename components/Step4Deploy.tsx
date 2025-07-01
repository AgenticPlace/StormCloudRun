/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC, useEffect } from 'react';
import WizardStep from './WizardStep';
import StepActions from './StepActions';
import ConfigSection from './ConfigSection';
import type { AppState, Action, LogEntry } from '../state/types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  handleApiError: (error: unknown, overrideMessage?: string) => void;
  onAnalyzeLogs: (logs: LogEntry[]) => void;
  onDeploy: () => Promise<void>;
}

const Step4Deploy: FC<Props> = ({ state, dispatch, handleApiError, onAnalyzeLogs, onDeploy }) => {
  useEffect(() => {
    // If deployment fails in autonomous mode, automatically analyze the logs.
    const hasError = state.deploymentLogs.some(l => l.level === 'ERROR');
    if (hasError && state.isAutonomousMode) {
      if (state.autonomousAttempts < state.autonomousIterations) {
        dispatch({
            type: 'APPEND_DEPLOY_LOG',
            payload: [{
                level: 'INFO',
                message: 'Deployment failed. Autonomous mode is analyzing logs...',
                timestamp: new Date()
            }]
        });
        onAnalyzeLogs(state.deploymentLogs);
      } else {
        dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message: `Autonomous mode failed after ${state.autonomousAttempts} attempts.` } });
      }
    }
  }, [state.deploymentLogs, state.isAutonomousMode, state.autonomousAttempts, state.autonomousIterations, onAnalyzeLogs, dispatch]);

  const handleManualDeploy = async () => {
    dispatch({ type: 'SET_AUTONOMOUS_CONFIG', payload: { key: 'isAutonomousMode', value: false }});
    await onDeploy();
  };

  const isDeployingOrDone = state.isDeploying || state.deploymentSuccess;

  return (
    <WizardStep>
      {!isDeployingOrDone && !state.deploymentSuccess && (
        <div className="review-panel">
          <div className="review-section">
            <h4 className="review-header"><span className="material-symbols-outlined">join_inner</span>Source & Destination</h4>
            <div className="review-item"><span className="label">GitHub Repository</span> <span className="value">{state.selectedRepo}</span></div>
            <div className="review-item"><span className="label">GCP Project</span> <span className="value">{state.project}</span></div>
            <div className="review-item"><span className="label">Service Name</span> <span className="value">{state.deploymentType === 'new' ? state.serviceName : state.existingService}</span></div>
            <div className="review-item"><span className="label">Region</span> <span className="value">{state.region}</span></div>
          </div>

          <div className="review-section">
             <h4 className="review-header"><span className="material-symbols-outlined">engineering</span>Build & Configuration</h4>
             <div className="review-item"><span className="label">Build Strategy</span> <span className="value">{state.buildStrategy === 'buildpacks' ? 'Google Cloud Buildpacks' : `Dockerfile`}</span></div>
             {state.environmentVariables.length > 0 && <div className="review-item"><span className="label">Environment Variables</span> <span className="value">{state.environmentVariables.length}</span></div>}
             {state.secrets.length > 0 && <div className="review-item"><span className="label">Secrets</span> <span className="value">{state.secrets.length}</span></div>}
             {(state.minInstances > 0 || state.maxInstances > 0) && <div className="review-item"><span className="label">Scaling (Min/Max)</span> <span className="value">{state.minInstances} / {state.maxInstances}</span></div>}
          </div>

          <div className="review-section">
             <h4 className="review-header"><span className="material-symbols-outlined">robot_2</span>Automation</h4>
             <div className="review-item"><span className="label">Continuous Deployment</span> <span className={`value ${state.enableCI ? 'success' : 'error'}`}>{state.enableCI ? 'Enabled' : 'Disabled'}</span></div>
             <div className="review-item"><span className="label">Autonomous Mode</span> <span className={`value ${state.isAutonomousMode ? 'success' : 'error'}`}>{state.isAutonomousMode ? `Enabled (${state.autonomousIterations} retries)` : 'Disabled'}</span></div>
          </div>
        </div>
      )}

      {state.deploymentSuccess ? (
        <div className="deployment-success-screen">
          <span className="material-symbols-outlined icon">celebration</span>
          <h3>Deployment Successful!</h3>
          <p>Your application is now live.</p>

          {state.fixApplied && (
            <div className="fix-summary-card">
              <header className="fix-summary-card-header">
                <span className="material-symbols-outlined">auto_awesome</span>
                <span>AI-Assisted Success</span>
              </header>
              <div className="fix-summary-card-body">
                <p>The AI assistant fixed it! The following change was applied to <strong>{state.fixApplied.filePath}</strong>:</p>
                <pre><code>{state.fixApplied.content}</code></pre>
              </div>
            </div>
          )}

          {state.deploymentUrl && (
              <a
                href={state.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ marginTop: '1.5rem', width: 'auto' }}
              >
                <span className="material-symbols-outlined">open_in_new</span>
                Visit Your Service
              </a>
          )}
          <button
            onClick={() => dispatch({ type: 'RESET_STATE' })}
            className="button secondary"
            style={{ marginTop: '1rem', width: 'auto' }}
          >
            Start New Deployment
          </button>
        </div>
      ) : state.isDeploying ? (
         <div className="step-explanation">
          <span className="material-symbols-outlined">pending</span>
          <div>
            <strong>Deployment in Progress...</strong>
            <p>Monitor the live logs in the console below. The UI will update here upon completion.</p>
          </div>
        </div>
      ) : (
        <>
          <ConfigSection title="Continuous Deployment (CI/CD)" isCollapsible={false}>
              <div className="toggle-switch">
                  <label className="toggle-switch-label" htmlFor="ci-toggle">Enable automatic deployments on commit</label>
                  <div className="switch">
                      <input id="ci-toggle" type="checkbox" checked={state.enableCI} onChange={() => dispatch({type: 'SET_CI', payload: !state.enableCI})} />
                      <span className="slider"></span>
                  </div>
              </div>
              <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b'}}>When enabled, a Cloud Build trigger will be created to automatically build and deploy new commits from your repository's main branch.</p>
          </ConfigSection>

          <ConfigSection title="Autonomous Mode (Experimental)" isCollapsible={false}>
              <div className="toggle-switch">
                  <label className="toggle-switch-label" htmlFor="auto-toggle">Enable AI-powered self-correction</label>
                  <div className="switch">
                      <input id="auto-toggle" type="checkbox" checked={state.isAutonomousMode} onChange={e => dispatch({type: 'SET_AUTONOMOUS_CONFIG', payload: {key: 'isAutonomousMode', value: e.target.checked}})} />
                      <span className="slider"></span>
                  </div>
              </div>
              <p style={{marginTop: '0.5rem', fontSize: '0.9rem', color: '#64748b'}}>
                  If the deployment fails, the AI assistant will automatically analyze the logs, suggest a fix, and allow you to apply it and retry.
              </p>
              {state.isAutonomousMode && (
                  <div className="input-group" style={{marginTop: '1rem'}}>
                      <label htmlFor="iterations">Max Retries:</label>
                      <input type="number" id="iterations" min="1" max="5" value={state.autonomousIterations} onChange={e => dispatch({type: 'SET_AUTONOMOUS_CONFIG', payload: {key: 'autonomousIterations', value: parseInt(e.target.value, 10)}})} />
                  </div>
              )}
          </ConfigSection>


          <StepActions>
            <button className="secondary" onClick={() => dispatch({ type: 'PREVIOUS_STEP' })} disabled={state.isDeploying}>Back</button>
            <button onClick={handleManualDeploy} disabled={state.isDeploying}>
              {state.isDeploying ? <><div className="spinner"></div> Deploying...</> : <><span className="material-symbols-outlined">rocket_launch</span>Deploy Now</>}
            </button>
          </StepActions>
        </>
      )}
    </WizardStep>
  );
};

export default Step4Deploy;