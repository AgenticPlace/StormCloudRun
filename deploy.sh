#!/bin/bash

# StormCloudRun Deployment Script
# Deploys StormCloudRun to Google Cloud Run using source build

set -e

echo "🚀 Deploying StormCloudRun to Google Cloud Run..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "@"; then
    echo "❌ You are not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ No Google Cloud project is set. Please run:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "📋 Project: $PROJECT_ID"

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    firestore.googleapis.com \
    cloudresourcemanager.googleapis.com

# Set environment variables for the deployment
echo "⚙️  Setting up environment variables..."

# You'll need to set these secrets in Google Secret Manager:
echo "📝 Make sure you have these secrets in Secret Manager:"
echo "   - oauth-client-secret (Google OAuth client secret)"
echo "   - github-client-secret (GitHub OAuth client secret)"

# Build and deploy using Cloud Build
echo "🏗️  Building and deploying with Cloud Build..."
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe stormcloudrun --region=us-central1 --format="value(status.url)" 2>/dev/null || echo "")

if [ -n "$SERVICE_URL" ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your StormCloudRun app is live at: $SERVICE_URL"
    echo ""
    echo "🔧 Next steps:"
    echo "   1. Update your OAuth redirect URIs to include: $SERVICE_URL"
    echo "   2. Set up your environment variables in Cloud Run"
    echo "   3. Configure your Google and GitHub OAuth applications"
else
    echo "❌ Deployment may have failed. Check the logs above."
    exit 1
fi 