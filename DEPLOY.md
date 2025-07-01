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

```txt
NODE_ENV=production
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
SESSION_SECRET=your-session-secret
ENCRYPTION_KEY=your-encryption-key
```

### 3. OAuth Redirect URIs

Update your OAuth applications to include:
```txt
- Google: `https://your-service-url.run.app/oauth2/google/callback`
- GitHub: `https://your-service-url.run.app/api/auth/github/callback`
```
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

# View service logs
```bash
gcloud run services logs read stormcloudrun --region=us-central1
```
# Get service details
```bash
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

### manual steps to first deployment

🚀 Deploying StormCloudRun to Google Cloud
This guide provides the complete, step-by-step instructions to deploy the full-stack StormCloudRun application to Google Cloud Run. The process uses a secure, automated, source-based deployment pipeline via Google Cloud Build.
# Prerequisites
Before you begin, ensure you have the following:
Google Cloud Project: A project with billing enabled. You will need the Project ID (e.g., eternal-delight-435801-c0).
Google Cloud SDK (gcloud): The command-line tool must be installed and authenticated on your local machine. If not, install it here.
GitHub Account: To register the OAuth application.
Node.js: To install and build the application's dependencies.
openssl: A command-line tool (pre-installed on macOS/Linux) for generating secure secrets.
Phase 1: Configuration & Credential Setup
This phase involves configuring Google Cloud and GitHub to recognize your application and generating the necessary secrets. This is a one-time setup.
# Generate Production Secrets
Your application requires two highly secure, random strings for session management and token encryption.
Generate a SESSION_SECRET: Open your local terminal and run:
```bash
openssl rand -base64 32
```
Copy the output (e.g., `f+Z/rY8LqV9aN...`). This will be your session secret.

Generate an ENCRYPTION_KEY: This key must be exactly 32 characters long. In your terminal, run:
```bash
openssl rand -hex 16
```
copy the 32-character hexadecimal output (e.g., a1b2c3d4...). This will be your encryption key.
Keep these two values ready for a later step.
# Configure the Google Cloud OAuth App
Navigate to the Google Cloud Console and select your project.<br />
Go to APIs & Services -> Credentials.<br />
Click + CREATE CREDENTIALS -> OAuth client ID.<br />
Select Web application and give it a name (e.g., "StormCloudRun Web App").<br />
Under Authorized redirect URIs, click + ADD URI and add your production backend callback URL:<br />
https://stormcloudrun-117975713968.us-west1.run.app/api/auth/google/callback<br />
Click CREATE. Copy the generated Client ID and Client Secret.<br />
# Configure the GitHub OAuth App
Navigate to your GitHub Settings -> Developer settings -> OAuth Apps.<br />
Click New OAuth App.<br />
Fill out the form:<br />
Application name: StormCloudRun<br />
Homepage URL: https://stormcloudrun-117975713968.us-west1.run.app<br />
Authorization callback URL: https://stormcloudrun-117975713968.us-west1.run.app/api/auth/github/callback<br />
Click Register application.<br />
On the next page, click Generate a new client secret. Copy the new Client Secret immediately.<br />
Step 4. Store All Secrets in Google Secret Manager<br />
Now, we will securely store all four secrets (google_secret, github_secret, session_secret, encryption_key) in Google Cloud.<br />
Open Cloud Shell ([>_]) in the Google Cloud Console.<br />

// Run the following commands one by one, pasting your actual secret values where indicated.<br />

# Store your Google Client Secret
```bash
echo "PASTE_YOUR_GOOGLE_CLIENT_SECRET_HERE" | gcloud secrets create oauth-client-secret --data-file=- --project=eternal-delight-435801-c0
```
# Store your GitHub Client Secret
```bash
echo "PASTE_YOUR_GITHUB_CLIENT_SECRET_HERE" | gcloud secrets create github-client-secret --data-file=- --project=eternal-delight-435801-c0
```
# Store the SESSION_SECRET you generated with openssl
```bash
echo "PASTE_YOUR_SESSION_SECRET_HERE" | gcloud secrets create SESSION_SECRET --data-file=- --project=eternal-delight-435801-c0
```
# Store the ENCRYPTION_KEY you generated with openssl
```bash
echo "PASTE_YOUR_ENCRYPTION_KEY_HERE" | gcloud secrets create ENCRYPTION_KEY --data-file=- --project=eternal-delight-435801-c0
```
# Grant Permissions
The service account for Cloud Build needs permission to deploy to Cloud Run.<br />
In the Google Cloud Console, go to IAM & Admin -> IAM.<br />
Find the principal that ends in @cloudbuild.gserviceaccount.com. Click the pencil icon to edit its roles.<br />
Add the following two roles:<br />
Cloud Run Admin<br />
Service Account User<br />
Click Save.<br />
Phase 2: Automated Deployment<br />
With the one-time setup complete, you can now deploy the application using the automated script.<br />
# Authenticate and Configure Your Local gcloud
In your local terminal (not Cloud Shell), authenticate your account:
```bash
gcloud auth login
```
Set your project as the default:
```bash
gcloud config set project eternal-delight-435801-c0
```
# Run the Deployment Script
Navigate to the root directory of the StormCloudRun project on your local machine.
Ensure the deployment script is executable:
```bash
chmod +x deploy.sh
```
Execute the script. This single command will start the entire build and deploy process.
```bash
./deploy.sh
```
The script will use the cloudbuild.yaml file to:
Enable all necessary APIs in your project.
Submit your code to Google Cloud Build.
Cloud Build will install dependencies, build the frontend, package it with the backend, and deploy the final application to Cloud Run with all necessary environment variables configured.
The script will output the final URL of your live service.
#  The Final Manual Step: Connect Secrets
For maximum security, the connection between the Cloud Run service and Secret Manager must be configured in the UI after the first deployment.<br />
Go to the Cloud Run page in the Google Cloud Console.<br />
Click on your stormcloudrun service.<br />
Click EDIT & DEPLOY NEW REVISION.<br />
Navigate to the Variables & Secrets tab.<br />
You will see that the cloudbuild.yaml file has already linked your secrets for you. Simply verify that the following references exist:<br />
SESSION_SECRET is referencing the SESSION_SECRET secret.<br />
ENCRYPTION_KEY is referencing the ENCRYPTION_KEY secret.<br />
GOOGLE_CLIENT_SECRET is referencing oauth-client-secret.<br />
GITHUB_CLIENT_SECRET is referencing github-client-secret.<br />
If they are all present (they should be), you can simply cancel this new revision. If not, add them as needed and click DEPLOY.<br />
Congratulations! Your StormCloudRun application is now live, secure, and fully functional.<br />
