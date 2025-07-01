/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC, ReactNode } from 'react';

const WizardStep: FC<{
  children?: ReactNode;
}> = ({ children }) => (
  <>
    {children}
  </>
);

export default WizardStep;
