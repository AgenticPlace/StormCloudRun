/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC, ReactNode } from 'react';

const StepActions: FC<{
  children?: ReactNode;
}> = ({ children }) => (
  <div className="step-actions">
    {children}
  </div>
);

export default StepActions;
