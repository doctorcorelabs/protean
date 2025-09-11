#!/bin/bash

# AI Molecular Research Platform - Deployment Script

set -e

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    
    print_success "All dependencies are available"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Build the project
build_project() {
    print_status "Building the project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Project built successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Deploy to Cloudflare Workers
deploy_worker() {
    print_status "Deploying Cloudflare Worker..."
    
    # Check if user is logged in to Wrangler
    if ! wrangler whoami &> /dev/null; then
        print_warning "Please login to Cloudflare first:"
        wrangler login
    fi
    
    # Deploy the worker
    wrangler deploy
    
    if [ $? -eq 0 ]; then
        print_success "Cloudflare Worker deployed successfully"
    else
        print_error "Worker deployment failed"
        exit 1
    fi
}

# Deploy to Netlify
deploy_netlify() {
    print_status "Deploying to Netlify..."
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        print_warning "Netlify CLI not found. Installing..."
        npm install -g netlify-cli
    fi
    
    # Deploy to Netlify
    netlify deploy --prod --dir=dist
    
    if [ $? -eq 0 ]; then
        print_success "Netlify deployment successful"
    else
        print_error "Netlify deployment failed"
        exit 1
    fi
}

# Main deployment function
main() {
    echo "🧬 AI Molecular Research Platform Deployment"
    echo "=============================================="
    
    # Parse command line arguments
    DEPLOY_WORKER=false
    DEPLOY_NETLIFY=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --worker)
                DEPLOY_WORKER=true
                shift
                ;;
            --netlify)
                DEPLOY_NETLIFY=true
                shift
                ;;
            --all)
                DEPLOY_WORKER=true
                DEPLOY_NETLIFY=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --worker    Deploy Cloudflare Worker only"
                echo "  --netlify   Deploy to Netlify only"
                echo "  --all       Deploy both Worker and Netlify"
                echo "  --help      Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # If no specific deployment target is specified, deploy both
    if [ "$DEPLOY_WORKER" = false ] && [ "$DEPLOY_NETLIFY" = false ]; then
        DEPLOY_WORKER=true
        DEPLOY_NETLIFY=true
    fi
    
    # Run deployment steps
    check_dependencies
    install_dependencies
    build_project
    
    if [ "$DEPLOY_WORKER" = true ]; then
        deploy_worker
    fi
    
    if [ "$DEPLOY_NETLIFY" = true ]; then
        deploy_netlify
    fi
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update your domain settings in Netlify dashboard"
    echo "2. Configure environment variables"
    echo "3. Test all functionality"
    echo "4. Share your platform with researchers!"
}

# Run main function
main "$@"


