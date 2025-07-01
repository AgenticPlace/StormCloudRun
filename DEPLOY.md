# 🚀 Deploy StormCloudRun to Google Cloud Run

This guide shows you how to deploy StormCloudRun to Google Cloud Run using source build - the same way StormCloudRun deploys other applications!

## Prerequisites

1. **Google Cloud CLI installed**: [Install gcloud](https://cloud.google.com/sdk/docs/install)
2. **Google Cloud Project**: Create or select a project with billing enabled
3. **GitHub Repository**: Push your code to a GitHub repository

## Quick Deploy

### Option 1: Using the Deploy Script (Recommended)

```bash
# Clone or navigate to your StormCloudRun repository
cd stormcloudrun

# Authenticate with Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Enable required APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com

# Deploy using Cloud Build
gcloud builds submit --config cloudbuild.yaml .
```

### Option 3: Direct Cloud Run Deploy

```bash
# Build frontend
npm run build

# Copy to backend
mkdir -p backend/public
cp -r dist/* backend/public/

# Deploy backend with frontend
gcloud run deploy stormcloudrun \
    --source=backend \
    --region=us-central1 \
    --allow-unauthenticated \
    --port=8080
```

## Configuration

After deployment, you need to set up:

### 1. Secret Manager Secrets

```bash
# Add your OAuth client secrets
gcloud secrets create oauth-client-secret --data-file=google-client-secret.txt
gcloud secrets create github-client-secret --data-file=github-client-secret.txt
```

### 2. Environment Variables

Set these in Cloud Run:

```
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
SESSION_SECRET=your-session-secret
ENCRYPTION_KEY=your-encryption-key
```

### 3. OAuth Redirect URIs

Update your OAuth applications to include:
- Google: `https://your-service-url.run.app/oauth2/google/callback`
- GitHub: `https://your-service-url.run.app/api/auth/github/callback`

## Using StormCloudRun to Deploy Itself

The meta approach - use StormCloudRun to deploy StormCloudRun:

1. Deploy StormCloudRun manually first (using above steps)
2. Access your deployed StormCloudRun app
3. Connect your Google and GitHub accounts
4. Select the StormCloudRun repository
5. Configure deployment settings
6. Deploy! 🎉

## Architecture

The deployment creates:
- **Frontend**: Built with Vite and served as static files
- **Backend**: Node.js server with Google Cloud APIs
- **Database**: Google Firestore for user data
- **Secrets**: Google Secret Manager for OAuth credentials

## Monitoring

View logs and metrics:
```bash
# View service logs
gcloud run services logs read stormcloudrun --region=us-central1

# Get service details
gcloud run services describe stormcloudrun --region=us-central1
```

## Troubleshooting

Common issues:
- **Build failures**: Check your `package.json` and `cloudbuild.yaml`
- **OAuth errors**: Verify redirect URIs and client secrets
- **Permission errors**: Ensure proper IAM roles are assigned

## Clean Up

To delete the service:
```bash
gcloud run services delete stormcloudrun --region=us-central1
``` 