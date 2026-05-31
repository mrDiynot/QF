#!/bin/bash
# QualiFlow Azure Key Vault Setup Script
# This script helps configure Azure Key Vault secrets for CI/CD integration
#
# Note: Doppler is only used for local development
# Staging and Production use Azure Key Vault

set -e

echo "🔐 QualiFlow Azure Key Vault Setup for GitHub Actions"
echo "======================================================"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found!"
    echo ""
    echo "Install Azure CLI:"
    echo "  macOS:  brew install azure-cli"
    echo "  Linux:  curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash"
    echo ""
    exit 1
fi

echo "✅ Azure CLI found"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found!"
    echo ""
    echo "Install GitHub CLI:"
    echo "  macOS:  brew install gh"
    echo "  Linux:  See https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

echo "✅ GitHub CLI found"
echo ""

# Login to Azure
echo "📝 Step 1: Login to Azure"
echo "--------------------------"
az login
echo ""

# Select subscription
echo "📝 Step 2: Select Azure Subscription"
echo "-------------------------------------"
az account list --output table
echo ""
read -p "Enter subscription ID: " SUBSCRIPTION_ID
az account set --subscription "$SUBSCRIPTION_ID"
echo "✅ Subscription set"
echo ""

# Create Azure AD App Registration for GitHub Actions
echo "📝 Step 3: Create Azure AD App Registration"
echo "--------------------------------------------"
echo "Creating app registration for GitHub Actions OIDC..."
echo ""

APP_NAME="QualiFlow GitHub Actions"
APP_ID=$(az ad app create --display-name "$APP_NAME" --query appId -o tsv)
echo "✅ App created: $APP_ID"

# Create service principal
az ad sp create --id $APP_ID
OBJECT_ID=$(az ad sp list --display-name "$APP_NAME" --query [0].id -o tsv)
echo "✅ Service principal created: $OBJECT_ID"
echo ""

# Configure federated credentials for GitHub Actions
echo "📝 Step 4: Configure OIDC Federated Credentials"
echo "------------------------------------------------"
echo ""

az ad app federated-credential create \
  --id $APP_ID \
  --parameters "{
    \"name\": \"QualiFlowGitHubActions\",
    \"issuer\": \"https://token.actions.githubusercontent.com\",
    \"subject\": \"repo:QualiFlow-ai/qualiflow.saas:ref:refs/heads/main\",
    \"audiences\": [\"api://AzureADTokenExchange\"]
  }"
echo "✅ Federated credentials configured"
echo ""

# Grant Key Vault access
echo "📝 Step 5: Grant Key Vault Access"
echo "----------------------------------"
echo ""

# Staging Key Vault
az keyvault set-policy \
  --name qualiflow-staging-kv \
  --object-id $OBJECT_ID \
  --secret-permissions get list
echo "✅ Access granted to qualiflow-staging-kv"

# Production Key Vault
az keyvault set-policy \
  --name qualiflow-prod-kv \
  --object-id $OBJECT_ID \
  --secret-permissions get list
echo "✅ Access granted to qualiflow-prod-kv"
echo ""

# Get Azure credentials
echo "📝 Step 6: Get Azure Credentials"
echo "---------------------------------"
TENANT_ID=$(az account show --query tenantId -o tsv)
echo "Client ID: $APP_ID"
echo "Tenant ID: $TENANT_ID"
echo "Subscription ID: $SUBSCRIPTION_ID"
echo ""

# Set GitHub secrets
echo "📝 Step 7: Setting GitHub Secrets"
echo "----------------------------------"
echo ""

echo "Setting AZURE_CLIENT_ID..."
echo "$APP_ID" | gh secret set AZURE_CLIENT_ID
echo "✅ AZURE_CLIENT_ID set"

echo "Setting AZURE_TENANT_ID..."
echo "$TENANT_ID" | gh secret set AZURE_TENANT_ID
echo "✅ AZURE_TENANT_ID set"

echo "Setting AZURE_SUBSCRIPTION_ID..."
echo "$SUBSCRIPTION_ID" | gh secret set AZURE_SUBSCRIPTION_ID
echo "✅ AZURE_SUBSCRIPTION_ID set"
echo ""

# Verify secrets are set
echo "📝 Step 8: Verifying GitHub Secrets"
echo "------------------------------------"
gh secret list
echo ""

# Trigger secrets sync workflow
echo "📝 Step 9: Triggering Secrets Sync"
echo "-----------------------------------"
echo ""
read -p "Trigger secrets sync workflow now? (y/n): " TRIGGER_SYNC

if [[ $TRIGGER_SYNC == "y" ]]; then
    gh workflow run secrets-sync.yml
    echo "✅ Secrets sync workflow triggered"
    echo ""
    echo "Check workflow status:"
    echo "  gh run list --workflow=secrets-sync.yml"
    echo "  gh run view <run-id> --log"
else
    echo "⏭️  Skipped workflow trigger"
    echo ""
    echo "Trigger manually later:"
    echo "  gh workflow run secrets-sync.yml"
fi

echo ""
echo "✅ Azure Key Vault Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Add secrets to Azure Key Vault (staging):"
echo "   az keyvault secret set --vault-name qualiflow-staging-kv --name CODECOV-TOKEN --value 'your-token'"
echo "   az keyvault secret set --vault-name qualiflow-staging-kv --name SNYK-TOKEN --value 'your-token'"
echo "   az keyvault secret set --vault-name qualiflow-staging-kv --name NEXT-PUBLIC-API-URL --value 'https://api-staging.qualiflow.com'"
echo ""
echo "2. Run secrets sync workflow:"
echo "   gh workflow run secrets-sync.yml"
echo ""
echo "3. Verify secrets synced to GitHub:"
echo "   gh secret list"
echo ""
echo "📖 Full documentation: SECRETS_MANAGEMENT.md"

