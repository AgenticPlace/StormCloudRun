#!/bin/bash
# ./deploy.sh

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
    secretmanager.googleapis.com \
    firestore.googleapis.com \
    iam.googleapis.com \
    artifactregistry.googleapis.com \
    --project=$PROJECT_ID

# Remind user about secrets (since these shouldn't be in the YAML)
echo "⚙️  Verifying production secrets..."
echo "📝 Please ensure these secrets exist in Google Secret Manager for project $PROJECT_ID:"
echo "   - oauth-client-secret (Your Google Client Secret)"
echo "   - github-client-secret (Your GitHub Client Secret)"
echo "   - SESSION_SECRET (A long, random string for cookies)"
echo "   - ENCRYPTION_KEY (A different, long, random string for tokens)"

# Submit the build using the YAML configuration
echo "🏗️  Submitting build to Google Cloud Build..."
gcloud builds submit --config cloudbuild.yaml . --project=$PROJECT_ID

# Get the service URL after the build is done
SERVICE_URL=$(gcloud run services describe stormcloudrun --region=us-west1 --format="value(status.url)" --project=$PROJECT_ID 2>/dev/null || echo "")

echo "------------------------------------------------------"
if [ -n "$SERVICE_URL" ]; then
    echo "✅ Deployment Succeeded!"
    echo "🌐 Your StormCloudRun app is live at: $SERVICE_URL"
    echo ""
    echo "🚨 FINAL MANUAL STEP 🚨"
    echo "You must now connect your production secrets to the Cloud Run service."
    echo "Go to the Cloud Run console -> stormcloudrun -> Edit & Deploy New Revision -> Variables & Secrets -> Reference your secrets."
else
    echo "❌ Deployment build submitted, but could not fetch service URL."
    echo "   Please check the build logs in the Google Cloud Console to confirm success."
fi
