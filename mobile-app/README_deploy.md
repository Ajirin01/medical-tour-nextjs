# Deploying SozoDigiCare Mobile App via SSH

## Prerequisites
- PowerShell (Windows) or a compatible terminal with `scp`/`rsync` installed.
- SSH access to the remote server (`app.sozodigicare.com`).
- The remote user must have write permissions to the target directory (e.g., `/var/www/html`).

## Steps
1. **Edit the deployment script**
   Open `deploy_ssh.ps1` and replace the placeholder values:
   ```powershell
   $remoteUser = "YOUR_SSH_USERNAME"
   $remoteHost = "your.server.com"   # e.g., app.sozodigicare.com
   $remotePath = "/var/www/html"      # Target directory on the server
   ```
2. **Run the script**
   ```powershell
   powershell -ExecutionPolicy Bypass -File "c:/Users/Olagoke Mubarak/Documents/nextjs_apps/sozodigicare-nextjs-global/mobile-app/deploy_ssh.ps1"
   ```
   You will be prompted for your SSH password or key passphrase.
3. **Verify**
   After the copy finishes, visit `https://app.sozodigicare.com` to confirm the site loads without mixed‑content warnings.
4. **Optional – Use rsync**
   If you have `rsync` (via WSL/Cygwin), uncomment the rsync block in the script for faster incremental uploads.

## Troubleshooting
- **Permission denied** – Ensure the remote user can write to `$remotePath`.
- **Host key verification failed** – Add the server to your `known_hosts` via `ssh $remoteUser@$remoteHost` first.
- **Mixed‑content warning persists** – Double‑check that the API URL is correctly set to `https://api.sozodigicare.com` in the built files.

---
*This file was generated automatically by Antigravity.*
