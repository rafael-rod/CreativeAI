#!/bin/bash

# EC2 Setup Script for AI SaaS Platform
# Run this script on a fresh Amazon Linux 2023 or Ubuntu 22.04 EC2 instance

set -e

echo "=== AI SaaS Platform EC2 Setup ==="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
fi

echo "Detected OS: $OS"

# Update system
echo "Updating system packages..."
if [ "$OS" = "amzn" ]; then
    sudo yum update -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get update && sudo apt-get upgrade -y
fi

# Install Docker
echo "Installing Docker..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
fi

# Install Docker Compose (for Amazon Linux)
if [ "$OS" = "amzn" ]; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Install Git
echo "Installing Git..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y git
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y git
fi

# Install Nginx (reverse proxy)
echo "Installing Nginx..."
if [ "$OS" = "amzn" ]; then
    sudo yum install -y nginx
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y nginx
fi

# Create app directory
echo "Creating application directory..."
sudo mkdir -p /opt/ai-saas
sudo chown $USER:$USER /opt/ai-saas

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Log out and back in for Docker group permissions to take effect"
echo "2. Clone your repository: git clone <your-repo> /opt/ai-saas"
echo "3. Create .env file in /opt/ai-saas with your environment variables"
echo "4. Run: cd /opt/ai-saas && docker-compose up -d --build"
echo "5. Configure Nginx as reverse proxy (see nginx.conf)"
echo ""
