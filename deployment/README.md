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

### Step B: Internal OS Firewall Configuration
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
Build the frontend with `VITE_API_BASE` left **empty** — the app uses relative URLs which Nginx proxies to the backend:
```bash
cd /opt/streakforge/frontend
npm install
VITE_API_BASE="" npm run build
```

> **Why empty?** With `VITE_API_BASE=""`, all fetch calls use relative paths like `/api/...` and `/uploads/...`.
> Nginx intercepts those and forwards them to `http://127.0.0.1:8000`. This way the frontend works
> correctly regardless of your server's IP or domain name — no rebuild needed if the IP changes.

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
# Edit the config to set your server IP or domain name
nano /opt/streakforge/deployment/nginx-streakforge.conf
# Replace YOUR_SERVER_IP_OR_DOMAIN with your actual IP (e.g. 80.225.195.25)

sudo cp /opt/streakforge/deployment/nginx-streakforge.conf /etc/nginx/sites-available/streakforge
sudo ln -sf /etc/nginx/sites-available/streakforge /etc/nginx/sites-enabled/streakforge

# Remove the default site if present (avoids conflicts on port 80)
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

> **What the Nginx config does:**
> - `location /uploads/` — proxies file-serving requests to Express (required for avatar and note attachment serving)
> - `location /api/` — proxies all REST API calls to Express
> - `location /` — serves the React SPA with HTML5 history fallback
> - `client_max_body_size 20M` — allows file uploads up to 20MB

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

---

## 8. Updating an Existing Deployment

Run these commands on the Oracle VM after pushing changes to the repository:

```bash
cd /opt/streakforge

# Pull latest code
git pull

# Rebuild frontend (if frontend files changed)
cd frontend
npm install
VITE_API_BASE="" npm run build
cd ..

# Reinstall backend deps (if package.json changed)
cd backend
npm install --production
cd ..

# Restart the API service
sudo systemctl restart streakforge-api

# Reload Nginx (only needed if nginx-streakforge.conf changed)
sudo nginx -t && sudo systemctl reload nginx
```

> **Tip:** To check if the API is running correctly after restart:
> ```bash
> sudo systemctl status streakforge-api
> curl http://127.0.0.1:8000/health
> ```

---

## 9. Production Compatibility Checklist

After deployment, verify these features work via `http://YOUR_SERVER_IP`:

| Feature | Path | Expected |
|---|---|---|
| Login | `/api/auth/login` | ✅ Returns JWT token |
| Registration | `/api/auth/signup` | ✅ Creates account |
| Avatar upload | `/api/auth/profile-picture` | ✅ Returns `/uploads/avatar-xxx.jpg` |
| Avatar preview | `/uploads/avatar-xxx.jpg` | ✅ Image loads in browser |
| Note file upload | `/api/notes/upload` | ✅ Returns `/uploads/xxx` |
| Note image preview | `/uploads/xxx.png` | ✅ Image renders in Notes tab |
| Note file download | `/uploads/xxx.pdf` | ✅ Browser downloads file |
| API health check | `/health` | ✅ `{"status":"ok"}` |

No URL should ever resolve to `localhost` from the browser's perspective.

---

## Architecture Overview

```
Browser
  │
  │  HTTP requests to http://YOUR_SERVER_IP
  ▼
Nginx (port 80)
  ├── /api/*      → proxy → Express :8000
  ├── /uploads/*  → proxy → Express :8000  (static file serving)
  └── /*          → React SPA (dist/index.html)
                              │
                              │
                         Express.js :8000
                              ├── /api/*    (REST endpoints)
                              └── /uploads/ (express.static)
                                    │
                                  MongoDB (localhost:27017)
```
