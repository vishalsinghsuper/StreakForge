# Oracle Cloud Deployment Guide

This guide details how to host StreakForge on a free-tier or standard Oracle Cloud Infrastructure (OCI) Compute Instance (running Ubuntu 22.04/24.04 LTS).

---

## 1. OCI Networking & Firewall Setup

By default, OCI blocks all ports except 22 (SSH). You must configure both OCI Ingress Rules and the VM's internal firewall.

### Step A: OCI Ingress Rules (VCN Console)
1. In the OCI Console, go to **Virtual Cloud Networks** -> Click your VCN -> **Security Lists** -> Click your Default Security List.
2. Click **Add Ingress Rules** and add two rules:
   - **Source CIDR**: `0.0.0.0/0` | **IP Protocol**: `TCP` | **Destination Port Range**: `80` (HTTP)
   - **Source CIDR**: `0.0.0.0/0` | **IP Protocol**: `TCP` | **Destination Port Range**: `443` (HTTPS)

### Step B: internal OS Firewall Configuration
Inside your Ubuntu VM terminal, open the ports:
```bash
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

---

## 2. Server Installation

Install Node.js (v18+), Nginx, MongoDB, and Git:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js, Nginx & Git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Install MongoDB Community Edition
sudo apt install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 3. Clone and Setup Project

Clone your repository to `/opt/streakforge`:

```bash
sudo mkdir -p /opt/streakforge
sudo chown -R ubuntu:ubuntu /opt/streakforge
git clone <your-repo-url> /opt/streakforge
cd /opt/streakforge
```

### Setup Environment Configuration
Copy the template to `/etc/streakforge.env` and populate your secrets:
```bash
sudo cp deployment/streakforge.env.example /etc/streakforge.env
sudo chown ubuntu:ubuntu /etc/streakforge.env
nano /etc/streakforge.env
```

---

## 4. Install Dependencies & Build Frontend

### Setup Backend
```bash
cd /opt/streakforge/backend
npm install --production
```

### Setup & Build Frontend
Build the frontend client pointing to the proxy endpoint:
```bash
cd /opt/streakforge/frontend
npm install
VITE_API_BASE= /opt/streakforge/node_modules/.bin/vite build # Builds static assets in dist/
```

---

## 5. Enable Systemd API Service

Create and enable the background systemd service for the API:

```bash
sudo cp /opt/streakforge/deployment/streakforge-api.service /etc/systemd/system/streakforge-api.service
sudo systemctl daemon-reload
sudo systemctl start streakforge-api
sudo systemctl enable streakforge-api

# Confirm it's active
sudo systemctl status streakforge-api
```

---

## 6. Configure Nginx Proxy

Copy the server block configuration and enable it:

```bash
sudo cp /opt/streakforge/deployment/nginx-streakforge.conf /etc/nginx/sites-available/streakforge
sudo ln -sf /etc/nginx/sites-available/streakforge /etc/nginx/sites-enabled/streakforge

# Test configuration and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Enable HTTPS (Certbot)

To secure authentication tokens via HTTPS, request a Let's Encrypt certificate:

```bash
sudo apt install -y snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

# Replace your-domain.com with your domain name
sudo certbot --nginx -d your-domain.com
```
