# Deploy the mobile app to a remote server via SSH (PowerShell)
# ---------------------------------------------------------------
# Fill in the variables below with your remote server details.
$remoteUser = "root"
$remoteHost = "your.server.com"   # e.g., app.sozodigicare.com
$remotePath = "/var/www/html"      # Target directory on the server

# Path to the local build output (dist folder)
$localDistPath = "c:/Users/Olagoke Mubarak/Documents/nextjs_apps/sozodigicare-nextjs-global/mobile-app/dist/*"

# Optional: Use rsync if you have it installed (e.g., via WSL or Cygwin)
# $useRsync = $true
# if ($useRsync) {
#     $command = "rsync -avz --delete $localDistPath $remoteUser@$remoteHost:$remotePath"
# } else {
#     $command = "scp -r $localDistPath $remoteUser@$remoteHost:$remotePath"
# }

# For simplicity, we default to scp here:
$command = "scp -r $localDistPath $remoteUser@$remoteHost:$remotePath"

Write-Host "Running command: $command"
# Execute the command. The user may be prompted for the SSH key passphrase or password.
Invoke-Expression $command

# After the copy completes, you may need to restart any services (e.g., a Node server) on the remote host.
# Example (run on the remote server via SSH):
# ssh $remoteUser@$remoteHost "sudo systemctl restart my-app.service"
