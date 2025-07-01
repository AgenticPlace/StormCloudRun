/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC } from 'react';
import WizardStep from './WizardStep';
import StepActions from './StepActions';
import { api } from '../api';
import type { AppState, Action } from '../state/types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  handleApiError: (error: unknown, overrideMessage?: string) => void;
}

const Step3Permissions: FC<Props> = ({ state, dispatch, handleApiError }) => {

  const handlePermissions = async () => {
    if (!state.googleLoggedIn) {
        handleApiError(new Error("Not authenticated with Google. Cannot grant permissions."));
        return;
    }
    dispatch({ type: 'START_GRANTING_PERMISSIONS' });
    const permissions = {
      'run.googleapis.com': 'Enable Cloud Run API',
      'cloudbuild.googleapis.com': 'Enable Cloud Build API',
      'artifactregistry.googleapis.com': 'Enable Artifact Registry API',
      'iam': 'Grant Cloud Build Service Account Permissions',
    };
    try {
      const permissionKeys = Object.keys(permissions);
      for await (const grantedPermKey of api.google.grantPermissions(permissionKeys)) {
        dispatch({ type: 'GRANT_PERMISSION_SUCCESS', payload: grantedPermKey });
      }
      dispatch({ type: 'GRANT_PERMISSIONS_COMPLETE' });
      setTimeout(() => dispatch({ type: 'SET_STEP', payload: 4 }), 500);
    } catch (error) {
      handleApiError(error);
      dispatch({ type: 'GRANT_PERMISSIONS_FAIL' });
    }
  };

  const permissions = {
    'run.googleapis.com': 'Enable Cloud Run API',
    'cloudbuild.googleapis.com': 'Enable Cloud Build API',
    'artifactregistry.googleapis.com': 'Enable Artifact Registry API',
    'iam': 'Grant Cloud Build Service Account Permissions',
  };

  return (
    <WizardStep>
      <div className="step-explanation">
        <span className="material-symbols-outlined">security</span>
        <div>
          <strong>Connecting the Dots</strong>
          <p>You've defined the source (GitHub Repo: <strong>{state.selectedRepo}</strong>) and the destination (Google Project: <strong>{state.project}</strong>). StormCloud now needs your permission to create the deployment pipeline by enabling the necessary APIs and setting permissions within your Google Cloud project.</p>
        </div>
      </div>
      <ul className="permission-list">
        {Object.entries(permissions).map(([key, value]) => (
          <li key={key} className={state.permissionsGranted[key] ? 'success' : ''}>
            <span className="icon">
              {state.isGranting && !state.permissionsGranted[key] ? <div className="spinner"></div> : <span className="material-symbols-outlined">{state.permissionsGranted[key] ? 'check_circle' : 'api'}</span>}
            </span>
            <span>{value}</span>
          </li>
        ))}
      </ul>
      <StepActions>
          <button className="secondary" onClick={() => dispatch({ type: 'PREVIOUS_STEP' })} disabled={state.isGranting}>Back</button>
          <button onClick={handlePermissions} disabled={state.isGranting || Object.keys(state.permissionsGranted).length > 0}>
            {state.isGranting ? <><div className="spinner"></div> Granting...</> : 'Grant & Continue'}
          </button>
      </StepActions>
    </WizardStep>
  );
};

export default Step3Permissions;