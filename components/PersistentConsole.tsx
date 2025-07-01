

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef, FC } from 'react';
import type { Action, LogEntry, LogLevel, ConsoleView } from '../state/types';
import * as markdown from '../markdown';

interface Props {
  view: ConsoleView;
  logs: LogEntry[];
  onAnalyze: (logs: LogEntry[]) => void;
  dispatch: React.Dispatch<Action>;
}

const levelConfig: Record<LogLevel, { icon: string; colorClass: string }> = {
  INFO: { icon: 'info', colorClass: 'info' },
  SUCCESS: { icon: 'check_circle', colorClass: 'success' },
  WARN: { icon: 'warning', colorClass: 'warning' },
  ERROR: { icon: 'error', colorClass: 'error' },
};

const markdownSources: Record<Exclude<ConsoleView, 'logs'>, { title: string, content: string }> = {
    // Core Concepts
    intro: { title: "Introduction", content: markdown.intro },
    features: { title: "Key Features", content: markdown.features },
    milestone: { title: "Milestone Tracker", content: markdown.milestone },
    modelcard: { title: "Model Card", content: markdown.modelcard },
    // Dev Guides
    developer: { title: "Developer Guide", content: markdown.developer },
    'self-hosting': { title: "Self-Hosting Guide", content: markdown.selfHosting },
    a2a: { title: "A2A Guide", content: markdown.a2a },
    // Tech Docs
    'auth-methods': { title: "Authentication Methods", content: markdown.authMethods},
    'oauth-clients': { title: "OAuth Clients Guide", content: markdown.oauthClients},
    'client-side-auth': { title: "Client Auth Guide", content: markdown.clientSideAuth },
    iam: { title: "IAM Guide", content: markdown.iam },
    secrets: { title: "Secrets Guide", content: markdown.secrets },
    'build-locations': { title: "Cloud Build Locations", content: markdown.buildLocations },
    // AI/Legal

    privacy: { title: "Privacy Notice", content: markdown.privacy},
};

const PersistentConsole: FC<Props> = ({ view, logs, onAnalyze, dispatch }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('Console');
    const [headerIcon, setHeaderIcon] = useState('terminal');
    const [headerIconClass, setHeaderIconClass] = useState('');
    const [hasCopied, setHasCopied] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const prevViewRef = useRef<ConsoleView | undefined>(undefined);

    useEffect(() => {
        if (isExpanded && scrollRef.current) {
            if (view === 'logs') {
                // For logs, always scroll to the bottom to show the latest entries
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            } else {
                // For markdown docs, scroll to the top
                scrollRef.current.scrollTop = 0;
            }
        }
    }, [view, logs, content, isExpanded]);

    useEffect(() => {
        const viewChanged = prevViewRef.current !== view;
        prevViewRef.current = view;

        if (view === 'logs') {
            const latestLog = logs.length > 0 ? logs[logs.length-1] : null;
            setTitle(latestLog ? latestLog.message : 'Deployment Log');
            setHeaderIcon(latestLog ? levelConfig[latestLog.level].icon : 'terminal');
            setHeaderIconClass(latestLog ? `log-icon-${latestLog.level}` : '');
        } else {
            const source = markdownSources[view as Exclude<ConsoleView, 'logs'>];
            setHeaderIcon('description');
            setHeaderIconClass('');
            setTitle(source.title);
            setContent(source.content);
            if (viewChanged) {
                setIsExpanded(true);
            }
        }
    }, [view, logs]);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        let textToCopy = '';
        if (view === 'logs') {
            textToCopy = logs.map(log => `[${log.timestamp.toISOString()}] [${log.level}] ${log.message}`).join('\n');
        } else {
            textToCopy = content;
        }
        navigator.clipboard.writeText(textToCopy);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    const handleAnalyze = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAnalyze(logs);
    };

    const renderContent = () => {
        if (view === 'logs') {
             if (logs.length === 0) {
                return <div className="log-entry info"><span className="log-message" style={{paddingLeft: '1rem'}}>Console is ready. Start a deployment to see live logs.</span></div>;
            }
            return logs.map((log, index) => (
                <div key={index} className={`log-entry ${levelConfig[log.level].colorClass}`}>
                    <span className="log-timestamp">{log.timestamp.toLocaleTimeString()}</span>
                    <span className={`material-symbols-outlined log-icon`}>{levelConfig[log.level].icon}</span>
                    <span className="log-message">{log.message}</span>
                </div>
            ));
        }

        return <pre className="markdown-content">{content}</pre>;
    };

    return (
        <div className={`persistent-console-container ${isExpanded ? 'expanded' : ''}`}>
            <header className="persistent-console-header" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="console-title">
                    <span className={`material-symbols-outlined icon ${headerIconClass}`}>{headerIcon}</span>
                    <span className="title-text">{title}</span>
                </div>
                <div className="console-controls">
                    {view === 'logs' && logs.some(l => l.level === 'ERROR') && (
                        <button onClick={handleAnalyze} className="console-btn analyze-btn" title="Analyze logs with AI">
                            <span className="material-symbols-outlined">psychology_alt</span>
                        </button>
                    )}
                    <button onClick={handleCopy} disabled={hasCopied} className="console-btn" title="Copy all content">
                        <span className="material-symbols-outlined">{hasCopied ? 'check' : 'content_copy'}</span>
                    </button>
                    <button className="console-btn" title={isExpanded ? 'Collapse' : 'Expand'}>
                        <span className="material-symbols-outlined">{isExpanded ? 'keyboard_arrow_down' : 'keyboard_arrow_up'}</span>
                    </button>
                </div>
            </header>
            <div className="console-body" ref={scrollRef}>
                {renderContent()}
            </div>
        </div>
    );
};

export default PersistentConsole;