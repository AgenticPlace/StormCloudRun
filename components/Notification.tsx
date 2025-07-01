/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { FC } from 'react';
import { AppNotification } from '../state/types';

interface Props {
  notification: AppNotification | null;
  onDismiss: () => void;
}

const iconMap = {
  error: 'error',
  success: 'check_circle',
  info: 'info',
  warning: 'warning',
};

const Notification: FC<Props> = ({ notification, onDismiss }) => {
  if (!notification) {
    return null;
  }

  const { type, message } = notification;
  const icon = iconMap[type];

  return (
    <div className="notification-container">
      <div className={`notification-toast ${type}`} role="alert" aria-live="assertive">
        <span className="material-symbols-outlined icon">{icon}</span>
        <p className="message">{message}</p>
        <button onClick={onDismiss} className="dismiss-btn" aria-label="Dismiss notification">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

export default Notification;
