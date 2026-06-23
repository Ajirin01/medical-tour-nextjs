import sys

with open('/etc/nginx/sites-enabled/sozodigicare', 'r') as f:
    content = f.read()

old = """# 4. Mobile Web App (Static SPA)
server {
    server_name app.sozodigicare.com;

    root /var/www/app.sozodigicare;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }"""

new = """# 4. Mobile Web App (Static SPA)
server {
    server_name app.sozodigicare.com;

    root /var/www/app.sozodigicare;
    index index.html;

    # Never cache index.html so browsers always get the latest bundle reference
    location = /index.html {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        try_files $uri /index.html;
    }

    # Cache static assets (JS/CSS/fonts) for 1 year - they have content hashes in filenames
    location ~* \.(js|css|woff2?|ttf|eot|ico|png|jpg|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }"""

if old in content:
    content = content.replace(old, new, 1)
    with open('/etc/nginx/sites-enabled/sozodigicare', 'w') as f:
        f.write(content)
    print('SUCCESS: nginx config updated')
else:
    print('ERROR: pattern not found in config')
    sys.exit(1)
