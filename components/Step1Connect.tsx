/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC, useEffect } from 'react';
import WizardStep from './WizardStep';
import StepActions from './StepActions';
import SkeletonLoader from './SkeletonLoader';
import { api } from '../api';
import type { AppState, Action } from '../state/types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  handleApiError: (error: unknown, overrideMessage?: string) => void;
}

const Step1Connect: FC<Props> = ({ state, dispatch, handleApiError }) => {

  const handleGoogleLogin = () => {
    dispatch({ type: 'START_GOOGLE_LOGIN' });
    try {
      api.auth.login();
      // The browser will be redirected. Code below this will not execute.
    } catch (error) {
      handleApiError(error, 'Failed to initiate login. Is the backend running?');
      dispatch({ type: 'GOOGLE_LOGIN_FAIL' });
    }
  };

  const handleLogout = async () => {
    dispatch({ type: 'START_LOGOUT' });
    try {
        await api.auth.logout();
        dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error) {
        handleApiError(error, 'Logout failed.');
        dispatch({ type: 'GOOGLE_LOGIN_FAIL' }); // Re-use fail state to stop spinner
    }
  };

  const handleGitHubLogin = async () => {
    dispatch({ type: 'START_GITHUB_LOGIN' });
    try {
      api.github.login();
      // The browser will be redirected. Code below this will not execute.
    } catch (error) {
      handleApiError(error, 'Failed to connect to GitHub. Is the backend running?');
      dispatch({ type: 'GITHUB_LOGIN_FAIL' });
    }
  };

  useEffect(() => {
    const fetchRepos = async () => {
      if (state.githubLoggedIn && state.repos.length === 0 && !state.isLoadingRepos) {
        dispatch({ type: 'START_REPO_FETCH' });
        try {
          const userRepos = await api.github.getRepos();
          dispatch({ type: 'REPO_FETCH_SUCCESS', payload: userRepos });
        } catch (error) {
          handleApiError(error, 'Could not fetch repositories.');
          dispatch({ type: 'REPO_FETCH_FAIL' });
        }
      }
    };
    fetchRepos();
  }, [state.githubLoggedIn, state.isLoadingRepos, state.repos.length, dispatch, handleApiError]);
  
  useEffect(() => {
    const fetchProjects = async () => {
        if (state.googleLoggedIn && state.projects.length === 0 && !state.isLoadingProjects) {
            dispatch({ type: 'START_PROJECTS_FETCH' });
            try {
                const fetchedProjects = await api.google.getProjects();
                dispatch({ type: 'PROJECTS_FETCH_SUCCESS', payload: fetchedProjects });
            } catch (error) {
                handleApiError(error, 'Could not fetch Google Cloud projects.');
                dispatch({ type: 'PROJECTS_FETCH_FAIL', payload: 'Failed to fetch projects.' });
            }
        }
    };
    fetchProjects();
  }, [state.googleLoggedIn, state.projects.length, state.isLoadingProjects, dispatch, handleApiError]);

  const canProceedToStep2 = state.googleLoggedIn && state.project && state.githubLoggedIn && state.selectedRepo;

  return (
    <WizardStep>
      {!state.googleLoggedIn ? (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="button" onClick={handleGoogleLogin} disabled={state.isConnectingGoogle}>
                {state.isConnectingGoogle ? <><div className="spinner"></div> Connecting...</> : <><span className="material-symbols-outlined">login</span> Connect to Google Cloud</>}
            </button>
        </div>
      ) : (
        <>
          <div className="status-box success" style={{justifyContent: 'space-between'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
              <span className="material-symbols-outlined">check_circle</span>
              <span>Logged in as <strong>{state.googleUser}</strong></span>
            </div>
            <button onClick={handleLogout} disabled={state.isConnectingGoogle} className="button secondary" style={{width: 'auto', padding: '0.5rem 1rem'}}>Logout</button>
          </div>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label htmlFor="project">Google Cloud Project</label>
            {state.isLoadingProjects ? <SkeletonLoader/> : (
                <select id="project" value={state.project} onChange={e => dispatch({ type: 'SET_PROJECT', payload: e.target.value })}>
                <option value="" disabled>Select a project</option>
                {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            )}
            {state.projectsError && <p className="contextual-error">{state.projectsError}</p>}
          </div>
        </>
      )}

      {state.googleLoggedIn && state.project && (
        <>
          <hr className="separator" />
          {!state.githubLoggedIn ? (
            <>
                <div className="step-explanation">
                    <span className="material-symbols-outlined">info</span>
                    <div>
                        <strong>Next Step: Connect Your Code</strong>
                        <p>Great! You've connected your Google Cloud account and selected a project. Now, please connect to GitHub to select the <strong>source code</strong> repository you wish to deploy.</p>
                    </div>
                </div>
                <button onClick={handleGitHubLogin} disabled={state.isConnectingGithub} className="github-login button">
                    {state.isConnectingGithub ? <><div className="spinner"></div> Connecting...</> : <><span className="material-symbols-outlined">hub</span> Connect to GitHub</>}
                </button>
            </>
          ) : (
            <>
              <div className="status-box success">
                <span className="material-symbols-outlined">check_circle</span>
                <span>Logged in as <strong>{state.githubUser}</strong></span>
              </div>
              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label htmlFor="repo">GitHub Repository</label>
                {state.isLoadingRepos ? <SkeletonLoader /> : (
                  <>
                    <select id="repo" value={state.selectedRepo} onChange={e => dispatch({ type: 'SET_REPO', payload: e.target.value })} disabled={state.isLoadingRepos}>
                      <option value="" disabled>Select a repository</option>
                      {state.repos.map(r => <option key={r.id} value={r.fullName}>{r.fullName}</option>)}
                    </select>
                    {state.reposError && <p className="contextual-error">{state.reposError}</p>}
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}


      {canProceedToStep2 && (
        <div className="step-explanation success">
          <span className="material-symbols-outlined">link</span>
          <div>
            <strong>Ready to Configure</strong>
            <p>Source and destination are connected. You can now proceed.</p>
          </div>
        </div>
      )}
      
      <StepActions>
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })} disabled={!canProceedToStep2}>Next</button>
      </StepActions>
    </WizardStep>
  );
};

export default Step1Connect;