/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC, useEffect } from 'react';
import WizardStep from './WizardStep';
import StepActions from './StepActions';
import SkeletonLoader from './SkeletonLoader';
import ConfigSection from './ConfigSection';
import { api } from '../api';
import type { AppState, Action } from '../state/types';

interface Props {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

// A simple cost calculator
const calculateCost = (region: string, minInstances: number): string => {
    if (minInstances === 0) {
        return "Scales to zero - you pay for usage.";
    }
    let baseCost = 10; // default for us-west1
    if (region === 'us-central1') baseCost = 8;
    if (region === 'europe-west1') baseCost = 12;

    return `~$${(baseCost * minInstances).toFixed(2)} / month`;
};

const Step2Configure: FC<Props> = ({ state, dispatch }) => {
  useEffect(() => {
    const fetchServices = async () => {
      if (state.project && state.deploymentType === 'existing' && state.googleLoggedIn && state.region) {
        dispatch({ type: 'START_SERVICES_FETCH' });
        try {
          const services = await api.google.getCloudRunServices(state.project, state.region);
          dispatch({ type: 'SERVICES_FETCH_SUCCESS', payload: services });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Could not fetch services.';
          dispatch({ type: 'SERVICES_FETCH_FAIL', payload: message });
          dispatch({ type: 'SET_NOTIFICATION', payload: { type: 'error', message } });
        }
      }
    };
    fetchServices();
  }, [state.project, state.deploymentType, state.googleLoggedIn, state.region, dispatch]);

  const canProceedToStep3 = state.deploymentType === 'new' ? state.serviceName && state.region : state.existingService && state.region;

  return (
    <WizardStep>
      <div className="form-group">
        <label>Deployment Target</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className={state.deploymentType === 'new' ? 'button' : 'button secondary'} onClick={() => dispatch({ type: 'SET_DEPLOYMENT_CONFIG', payload: { key: 'deploymentType', value: 'new' } })}>Create New Service</button>
          <button className={state.deploymentType === 'existing' ? 'button' : 'button secondary'} onClick={() => dispatch({ type: 'SET_DEPLOYMENT_CONFIG', payload: { key: 'deploymentType', value: 'existing' } })}>Deploy to Existing</button>
        </div>
      </div>
      {state.deploymentType === 'new' ? (
        <div className="form-group">
          <label htmlFor="serviceName">New Service Name</label>
          <input type="text" id="serviceName" value={state.serviceName} onChange={e => dispatch({ type: 'SET_DEPLOYMENT_CONFIG', payload: { key: 'serviceName', value: e.target.value } })} placeholder="e.g., my-awesome-app" />
        </div>
      ) : (
        <div className="form-group">
          <label htmlFor="existingService">Existing Cloud Run Service</label>
          {state.isLoadingServices ? <SkeletonLoader /> : (
            <>
              <select id="existingService" value={state.existingService} onChange={e => dispatch({ type: 'SET_DEPLOYMENT_CONFIG', payload: { key: 'existingService', value: e.target.value } })} disabled={state.isLoadingServices}>
                <option value="" disabled>Select a service</option>
                {state.existingServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {state.servicesError && <p className="contextual-error">{state.servicesError}</p>}
            </>
          )}
        </div>
      )}
      <div className="form-group">
        <label htmlFor="region">Region</label>
        <select id="region" value={state.region} onChange={e => dispatch({ type: 'SET_DEPLOYMENT_CONFIG', payload: { key: 'region', value: e.target.value } })}>
          <option value="us-west1">us-west1 (Oregon)</option>
          <option value="us-central1">us-central1 (Iowa)</option>
          <option value="europe-west1">europe-west1 (Belgium)</option>
        </select>
      </div>
      
      <hr className="separator"/>

      <ConfigSection title="Build Strategy" defaultOpen={true}>
          <div className="radio-group">
              <label>
                  <input type="radio" name="buildStrategy" value="buildpacks" checked={state.buildStrategy === 'buildpacks'} onChange={() => dispatch({ type: 'SET_BUILD_STRATEGY', payload: 'buildpacks' })} />
                  Google Cloud Buildpacks (Recommended)
              </label>
              <label>
                  <input type="radio" name="buildStrategy" value="dockerfile" checked={state.buildStrategy === 'dockerfile'} onChange={() => dispatch({ type: 'SET_BUILD_STRATEGY', payload: 'dockerfile' })} />
                  Use a Dockerfile
              </label>
          </div>
          {state.buildStrategy === 'dockerfile' && (
              <div className="form-group" style={{marginTop: '1rem', marginLeft: '1.75rem'}}>
                  <label htmlFor="dockerfilePath">Dockerfile path</label>
                  <input type="text" id="dockerfilePath" value={state.dockerfilePath} onChange={e => dispatch({ type: 'SET_DOCKERFILE_PATH', payload: e.target.value })} />
              </div>
          )}
      </ConfigSection>

      <ConfigSection title="Environment Variables">
        {state.environmentVariables.map((env, index) => (
            <div key={index} className="key-value-row">
                <input type="text" placeholder="KEY" value={env.key} onChange={e => dispatch({ type: 'UPDATE_ENV_VAR', payload: { index, key: 'key', value: e.target.value }})}/>
                <input type="text" placeholder="VALUE" value={env.value} onChange={e => dispatch({ type: 'UPDATE_ENV_VAR', payload: { index, key: 'value', value: e.target.value }})}/>
                <button onClick={() => dispatch({ type: 'REMOVE_ENV_VAR', payload: index })}><span className="material-symbols-outlined">delete</span></button>
            </div>
        ))}
        <button className="button secondary" style={{width: 'auto', alignSelf: 'flex-start'}} onClick={() => dispatch({ type: 'ADD_ENV_VAR' })}>Add Variable</button>
      </ConfigSection>

      <ConfigSection title="Secrets">
          {state.secrets.map((secret, index) => (
              <div key={index} className="key-value-row">
                  <input type="text" placeholder="Secret Name" value={secret.name} onChange={e => dispatch({ type: 'UPDATE_SECRET', payload: { index, key: 'name', value: e.target.value }})} />
                  <input type="text" placeholder="Version (e.g., latest)" value={secret.version} onChange={e => dispatch({ type: 'UPDATE_SECRET', payload: { index, key: 'version', value: e.target.value }})} />
                  <input type="text" placeholder="Exposed Env Var" value={secret.envVarName} onChange={e => dispatch({ type: 'UPDATE_SECRET', payload: { index, key: 'envVarName', value: e.target.value }})} />
                  <button onClick={() => dispatch({ type: 'REMOVE_SECRET', payload: index })}><span className="material-symbols-outlined">delete</span></button>
              </div>
          ))}
          <button className="button secondary" style={{width: 'auto', alignSelf: 'flex-start'}} onClick={() => dispatch({ type: 'ADD_SECRET' })}>Add Secret</button>
      </ConfigSection>

      <ConfigSection title="Scaling">
          <div className="input-group">
            <label htmlFor="minInstances">Min Instances</label>
            <input type="number" id="minInstances" min="0" value={state.minInstances} onChange={e => dispatch({ type: 'SET_SCALING_CONFIG', payload: { key: 'minInstances', value: parseInt(e.target.value, 10) }})}/>
          </div>
          <div className="input-group">
            <label htmlFor="maxInstances">Max Instances</label>
            <input type="number" id="maxInstances" min="0" value={state.maxInstances} onChange={e => dispatch({ type: 'SET_SCALING_CONFIG', payload: { key: 'maxInstances', value: parseInt(e.target.value, 10) }})}/>
          </div>
          <div className="cost-estimator">
              <div className="cost-estimator-label">
                  <span className="material-symbols-outlined">payments</span>
                  <span>Estimated Baseline Cost</span>
              </div>
              <div className="cost-estimator-price">
                  {calculateCost(state.region, state.minInstances)}
              </div>
              <p className="cost-estimator-disclaimer">
                  Based on minimum instances always-on. Additional costs for requests, CPU, and memory apply.
              </p>
          </div>
      </ConfigSection>

      <StepActions>
        <button className="secondary" onClick={() => dispatch({ type: 'PREVIOUS_STEP' })}>Back</button>
        <button onClick={() => dispatch({ type: 'SET_STEP', payload: 3 })} disabled={!canProceedToStep3}>Next</button>
      </StepActions>
    </WizardStep>
  );
};

export default Step2Configure;