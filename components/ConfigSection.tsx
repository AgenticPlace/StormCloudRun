/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC, useState } from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isCollapsible?: boolean;
}

const ConfigSection: FC<Props> = ({ title, children, defaultOpen = false, isCollapsible = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const headerProps = {
    onClick: isCollapsible ? () => setIsOpen(!isOpen) : undefined,
    style: { cursor: isCollapsible ? 'pointer' : 'default' }
  };

  return (
    <div className="config-section">
      <header className="config-section-header" {...headerProps}>
        <h3>{title}</h3>
        {isCollapsible && <span className={`material-symbols-outlined ${isOpen ? 'expanded' : ''}`}>expand_more</span>}
      </header>
      {(isOpen || !isCollapsible) && (
        <div className="config-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default ConfigSection;