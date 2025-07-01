/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC } from 'react';

interface Props {
  currentStep: number;
}

const steps = ["Connect", "Configure", "Permissions", "Deploy"];

const WizardProgress: FC<Props> = ({ currentStep }) => {
  return (
    <div className="wizard-progress-bar">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div
            key={label}
            className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
          >
            <div className="step-marker">
              {isCompleted ? <span className="material-symbols-outlined">check</span> : stepNumber}
            </div>
            <div className="step-label">{label}</div>
            <div className="connector"></div>
          </div>
        );
      })}
    </div>
  );
};

export default WizardProgress;
