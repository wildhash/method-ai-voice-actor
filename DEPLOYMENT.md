# Deployment Guide

This guide explains how to host the Method AI Voice Actor application on a Linux VPS (Virtual Private Server) and set up automatic deployments ("hot swapping") whenever you push to the `main` branch.

## Prerequisites

1.  **A Linux Server**: Ubuntu 22.04 or 24.04 LTS is recommended.
    *   Providers: DigitalOcean ($6/mo droplet), Hetzner, AWS Lightsail, Linode.
    *   Specs: Minimum 2GB RAM (Node.js builds can be memory hungry).
2.  **Domain Name** (Optional but recommended): e.g., `method-actor.com`.

## Part 1: Server Setup

SSH into your server:
```bash
ssh root@your-server-ip
```

### 1. Install Docker & Git
Run these commands to install the necessary tools:

```bash
# Update packages
apt update && apt upgrade -y

# Install Docker and Git
apt install -y docker.io docker-compose-v2 git

# Start Docker
systemctl enable --now docker
```

### 2. Clone the Repository
We will store the app in `/opt/method-ai-voice-actor`.

```bash
cd /opt
git clone https://github.com/wildhash/method-ai-voice-actor.git
cd method-ai-voice-actor
```

### 3. Configure Environment Variables
Create the `.env` file for the backend.

```bash
# Create .env file
nano backend/.env
```

Paste your API keys (same as your local `.env`):
```env
PORT=3001
ELEVENLABS_API_KEY=your_elevenlabs_key_here
GEMINI_API_KEY=your_gemini_key_here
```
*Press `Ctrl+X`, then `Y`, then `Enter` to save.*

### 4. Initial Run
Test that everything works manually first.

```bash
docker compose up -d --build
```

Check if it's running:
```bash
docker compose ps
```
You should see `frontend` on port 80 and `backend` on port 3001.
Visit `http://your-server-ip` in your browser.

---

## Part 2: Automatic Deployment (Hot Swapping)

We will use GitHub Actions to automatically update the server whenever you push code.

### 1. Generate SSH Key Pair
On your **local machine** (not the server), generate a new SSH key for deployment:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/method_deploy
```
*Press Enter for no passphrase.*

### 2. Add Public Key to Server
Copy the content of the **public** key (`method_deploy.pub`).

On your **server**:
```bash
# Open authorized_keys
nano ~/.ssh/authorized_keys
```
Paste the public key on a new line. Save and exit.

### 3. Configure GitHub Secrets
Go to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.

Add the following Repository Secrets:

| Name | Value |
|------|-------|
| `DEPLOY_HOST` | Your server's IP address (e.g., `123.45.67.89`) |
| `DEPLOY_USER` | `root` (or your server username) |
| `DEPLOY_KEY` | The content of your **private** key (`method_deploy` file from Step 2.1) |

### 4. Test It!
Make a small change to your code (e.g., update README) and push to `main`.
Go to the **Actions** tab in GitHub. You should see the "Deploy to Production" workflow running.
Once green, your server is updated!

---

## Troubleshooting

**Build fails due to memory:**
If your server runs out of RAM during `npm run build`, add a swap file:
```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

**Logs:**
To see what's happening on the server:
```bash
cd /opt/method-ai-voice-actor
docker compose logs -f
```
