/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// This file aggregates the content of all other project files to be used as a single,
// comprehensive context for the AI assistant. This gives the assistant "self-awareness"
// of its own source code and documentation.

const projectOverview = `
StormCloudRun - One-click deployment tool for Google Cloud Run

ARCHITECTURE:
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + Google Cloud APIs
- Authentication: OAuth 2.0 (Google + GitHub)
- Database: Google Firestore
- Security: Token encryption, session management

KEY FEATURES:
1. OAuth authentication with Google and GitHub
2. Visual wizard-based deployment process (4 steps)
3. Real-time deployment logging with streaming
4. AI-powered deployment assistance
5. Responsive design with modern UI
6. Production-ready security with encrypted tokens

DEPLOYMENT FLOW:
Step 1: Connect accounts (Google + GitHub)
Step 2: Configure deployment (project, repo, settings)
Step 3: Grant permissions (IAM roles)
Step 4: Deploy and monitor logs

TECHNOLOGY STACK:
- React 18 with hooks and functional components
- TypeScript for type safety
- Vite for fast development and bundling
- Material Symbols for icons
- CSS custom properties for theming
- WebSocket-like streaming for real-time updates
`;

const backendApiRoutes = `
BACKEND API ROUTES (/backend/server.js):

Authentication:
- POST /auth/google - Initiate Google OAuth flow
- POST /auth/github - Initiate GitHub OAuth flow  
- GET /auth/status - Check authentication status
- POST /auth/logout - Logout user

Google Cloud APIs:
- GET /api/google/projects - List Google Cloud projects
- GET /api/google/services - List Cloud Run services
- POST /api/google/permissions - Grant IAM permissions (streaming)
- POST /api/google/deploy - Deploy to Cloud Run (streaming)

GitHub APIs:
- GET /api/github/repos - List GitHub repositories

AI Assistant:
- POST /api/assistant/chat - Chat with AI assistant

All API routes are protected with isAuthenticated middleware
All tokens are encrypted before storage in Firestore
Streaming endpoints use Server-Sent Events (SSE)
`;

const componentStructure = `
REACT COMPONENTS STRUCTURE:

/components/
├── WizardProgress.tsx - Progress indicator for 4-step wizard
├── Step1Connect.tsx - Google/GitHub account connection
├── Step2Configure.tsx - Project and deployment configuration  
├── Step3Permissions.tsx - IAM permission granting
├── Step4Deploy.tsx - Deployment execution and monitoring
├── StepActions.tsx - Common action buttons for wizard steps
├── ChatWidget.tsx - AI assistant chat interface
├── PersistentConsole.tsx - Deployment logs console
├── Console.tsx - Log display component
├── ConfigSection.tsx - Configuration form sections
├── Notification.tsx - Toast notifications
└── SkeletonLoader.tsx - Loading skeletons

/state/
├── types.ts - TypeScript interfaces and types
└── reducer.ts - Redux-style state management

Key files:
├── index.tsx - Main React application entry point
├── api.ts - API client with all backend calls
├── context.ts - This file (project context for AI)
├── markdown.ts - Documentation content
└── docs.ts - Documentation routing
`;

// Export the full application context
export const fullAppCodeContext = `${projectOverview}

${backendApiRoutes}

${componentStructure}

CURRENT STATE:
- Backend: 100% production-ready with enterprise security
- Frontend: Modern React app with TypeScript
- Authentication: Complete OAuth flows with token encryption
- API Integration: Full Google Cloud and GitHub API integration
- UI/UX: Professional wizard-based interface
- Documentation: Comprehensive docs in /docs/ folder

The application is designed for one-click deployments to Google Cloud Run with a focus on developer experience and enterprise-grade security.
`; 