/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, FC, useEffect } from 'react';
import type { ChatMessage, SuggestedFix } from '../state/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isLoading: boolean;
  onQuery: (query: string) => void;
  onApplyFix: (fix: SuggestedFix) => void;
  isAssistantEnabled: boolean;
}

const SuggestedFixBlock: FC<{fix: SuggestedFix, onApply: (fix: SuggestedFix) => void}> = ({fix, onApply}) => (
    <div className="suggested-fix-block">
        <header className="suggested-fix-header">
            <span className="material-symbols-outlined">auto_fix</span>
            <span>Suggested Fix</span>
        </header>
        <div className="suggested-fix-body">
            <p>The AI has proposed a change to the file <strong>{fix.filePath}</strong>.</p>
            <pre><code>{fix.content}</code></pre>
            <button className="button" onClick={() => onApply(fix)}>
                <span className="material-symbols-outlined">construction</span>
                Apply & Retry
            </button>
        </div>
    </div>
);

const ChatWidget: FC<Props> = ({ isOpen, onClose, messages, isLoading, onQuery, onApplyFix, isAssistantEnabled }) => {
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuery.trim() || isLoading) return;
    onQuery(currentQuery);
    setCurrentQuery('');
  };

  if (!isOpen) {
    return null;
  }

  const showInitialMessage = messages.length === 0 && !isLoading;

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Cloud Run Assistant</h3>
        <button className="close-btn" onClick={onClose} aria-label="Close chat">
            <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message-bubble ${msg.role}`}>
            {msg.content}
            {msg.suggestedFix && <SuggestedFixBlock fix={msg.suggestedFix} onApply={onApplyFix} />}
          </div>
        ))}
        {isLoading && <div className="message-bubble assistant"><div className="spinner"></div></div>}
        {showInitialMessage && (
          <div className="message-bubble assistant">
            {!isAssistantEnabled
              ? "Please sign in with your Google account to enable the AI assistant."
              : "Hi! Ask me anything about Cloud Run, or click the \"Analyze with AI\" button in the console after a deployment to get help."
            }
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
        <div className="chat-input-area">
            <form className="chat-input-form" onSubmit={handleQuerySubmit}>
                <input
                type="text"
                value={currentQuery}
                onChange={e => setCurrentQuery(e.target.value)}
                placeholder={!isAssistantEnabled ? "Sign in with Google to chat" : "Type your question..."}
                disabled={isLoading || !isAssistantEnabled}
                />
                <button type="submit" disabled={isLoading || !currentQuery.trim() || !isAssistantEnabled}>
                <span className="material-symbols-outlined">send</span>
                </button>
            </form>
            {isAssistantEnabled && (
                <div className="privacy-notice">
                    Prompts may be reviewed by Google. Do not enter confidential info. See Privacy Notice.
                </div>
            )}
        </div>
    </div>
  );
};

export default ChatWidget;