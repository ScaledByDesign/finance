#!/bin/bash

# Elysia Integration Setup Script
# This script helps set up the Elysia AI integration for the finance application

set -e

echo "🚀 Setting up Elysia AI Integration..."

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

# Check if Docker is running
check_docker() {
    print_status "Checking Docker..."
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Check if required files exist
check_files() {
    print_status "Checking required files..."
    
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml not found. Please run this script from the project root."
        exit 1
    fi
    
    if [ ! -f ".env.docker" ]; then
        print_error ".env.docker not found. Please ensure environment file exists."
        exit 1
    fi
    
    if [ ! -d "elysia" ]; then
        print_error "elysia directory not found. Please ensure Elysia files are in place."
        exit 1
    fi
    
    print_success "All required files found"
}

# Check OpenAI API key
check_api_key() {
    print_status "Checking OpenAI API key..."
    
    if grep -q "OPENAI_API_KEY=sk-" .env.docker; then
        print_success "OpenAI API key found in .env.docker"
    else
        print_warning "OpenAI API key not found or invalid in .env.docker"
        print_warning "Please ensure you have a valid OpenAI API key set"
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Stop any existing services
    docker-compose down
    
    # Build and start services
    docker-compose up -d --build
    
    print_success "Services started"
}

# Wait for services to be healthy
wait_for_services() {
    print_status "Waiting for services to be healthy..."
    
    # Wait for Weaviate
    print_status "Waiting for Weaviate..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8080/v1/.well-known/ready > /dev/null 2>&1; then
            print_success "Weaviate is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Weaviate failed to start within 60 seconds"
        return 1
    fi
    
    # Wait for Elysia
    print_status "Waiting for Elysia..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:8000/health > /dev/null 2>&1; then
            print_success "Elysia is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Elysia failed to start within 60 seconds"
        return 1
    fi
    
    # Wait for main app
    print_status "Waiting for main application..."
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3002/api/v1/elysia/health > /dev/null 2>&1; then
            print_success "Main application is ready"
            break
        fi
        sleep 2
        timeout=$((timeout - 2))
    done
    
    if [ $timeout -le 0 ]; then
        print_error "Main application failed to start within 60 seconds"
        return 1
    fi
}

# Test the integration
test_integration() {
    print_status "Testing Elysia integration..."
    
    # Test health endpoint
    if curl -f http://localhost:3002/api/v1/elysia/health > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        return 1
    fi
    
    # Test collections endpoint
    if curl -f http://localhost:3002/api/v1/elysia/collections > /dev/null 2>&1; then
        print_success "Collections endpoint accessible"
    else
        print_warning "Collections endpoint not accessible (may require authentication)"
    fi
}

# Show service status
show_status() {
    print_status "Service Status:"
    echo ""
    docker-compose ps
    echo ""
    
    print_status "Service URLs:"
    echo "• Main Application: http://localhost:3002"
    echo "• Elysia API: http://localhost:8000"
    echo "• Weaviate: http://localhost:8080"
    echo "• PostgreSQL: localhost:5432"
    echo "• Redis: localhost:6380"
    echo "• LocalStripe: http://localhost:8420"
    echo ""
    
    print_status "Health Check URLs:"
    echo "• Elysia Health: http://localhost:8000/health"
    echo "• Weaviate Health: http://localhost:8080/v1/.well-known/ready"
    echo "• Integration Health: http://localhost:3002/api/v1/elysia/health"
}

# Main execution
main() {
    echo "🤖 Elysia AI Integration Setup"
    echo "=============================="
    echo ""
    
    check_docker
    check_files
    check_api_key
    
    echo ""
    print_status "Starting setup process..."
    
    start_services
    
    echo ""
    print_status "Waiting for services to be ready..."
    if wait_for_services; then
        echo ""
        print_status "Testing integration..."
        if test_integration; then
            echo ""
            print_success "🎉 Elysia AI integration setup complete!"
            echo ""
            show_status
            echo ""
            print_success "You can now use advanced AI analysis in your finance application!"
            print_status "Try asking complex questions like:"
            echo "  • 'Analyze my spending patterns'"
            echo "  • 'What investment recommendations do you have?'"
            echo "  • 'Optimize my budget allocation'"
        else
            print_error "Integration tests failed. Please check the logs."
            exit 1
        fi
    else
        print_error "Services failed to start properly. Please check the logs."
        exit 1
    fi
}

# Run main function
main "$@"
