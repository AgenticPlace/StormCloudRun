# StormCloudRun: One-Click Deployment to Google Cloud Run

StormCloudRun is a premier, one-click deployment tool designed to bridge the gap between a developer's source code on GitHub and a running service on Google Cloud Run. It is built to be powerful, elegant, and agnostic, serving as a flagship example of how modern web technologies can create a seamless and intelligent developer experience.

## Quick Start

**Prerequisites:** Node.js 18+

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/stormcloudrun.git
   cd stormcloudrun
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the backend:**
   ```bash
   cd backend
   npm install
   # Copy .env.example to .env and configure your credentials
   cp .env.example .env
   npm start
   ```

4. **Run the frontend:**
   ```bash
   # In the root directory
   npm run dev
   ```

## Documentation

All documentation is now organized in the `docs/` folder:

### Getting Started
- [`intro.md`](intro.md) - Project vision and mission
- [`features.md`](features.md) - Key features overview
- [`developer.md`](developer.md) - Comprehensive developer guide

### Authentication & Security
- [`auth-methods.md`](auth-methods.md) - Authentication methods and OAuth 2.0 flow
- [`client-side-auth.md`](client-side-auth.md) - Client-side OAuth implementation
- [`oauth-clients.md`](oauth-clients.md) - Managing OAuth clients
- [`iam.md`](iam.md) - Google Cloud IAM overview
- [`secrets.md`](secrets.md) - Secret Manager API documentation

### AI & Automation
- [`free-ai-service.md`](free-ai-service.md) - Free AI service implementation
- [`a2a.md`](a2a.md) - Agent-to-Agent API specification
- [`modelcard.md`](modelcard.md) - AI agent model card

### Project Information
- [`milestone.md`](milestone.md) - Project milestone tracker
- [`todo.md`](todo.md) - Development TODO list
- [`privacy.md`](privacy.md) - Privacy notice for AI assistant
- [`cloudbuild-locations.md`](cloudbuild-locations.md) - Available Cloud Build regions

## Architecture

StormCloudRun uses a full-stack architecture with:
- **React Frontend**: User interface with step-by-step deployment wizard
- **Node.js Backend**: Secure API proxy handling authentication and deployment
- **AI Assistant**: Powered by Google Code Assist for intelligent help and autonomous error correction

## License

Licensed under the Apache 2.0 License - see the LICENSE file for details.

---

*A gift to the Google Cloud and open-source communities from MINDX Augmentic Intelligence*
