import sys

with open('/etc/nginx/sites-enabled/sozodigicare', 'r') as f:
    content = f.read()

# Find the app.sozodigicare.com server block location / section and add no-cache for index.html before it
# We look for the specific pattern in the app block only
old = (
    '    location / {\n'
    '        try_files $uri $uri/ /index.html;\n'
    '    }\n'
    '\n'
    '    listen 443 ssl; # managed by Certbot\n'
    '    ssl_certificate /etc/letsencrypt/live/sozodigicare.com/fullchain.pem; # managed by Certbot\n'
    '    ssl_certificate_key /etc/letsencrypt/live/sozodigicare.com/privkey.pem; # managed by Certbot\n'
    '    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot\n'
    '    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot\n'
    '\n'
    '}\n'
    '\n'
    'server {\n'
    '    if ($host = app.sozodigicare.com) {'
)

new = (
    '    # Never cache index.html - always serve the latest bundle\n'
    '    location = /index.html {\n'
    '        add_header Cache-Control "no-store, no-cache, must-revalidate, max-age=0";\n'
    '        add_header Pragma "no-cache";\n'
    '        add_header Expires "0";\n'
    '        try_files $uri /index.html;\n'
    '    }\n'
    '\n'
    '    location / {\n'
    '        try_files $uri $uri/ /index.html;\n'
    '    }\n'
    '\n'
    '    listen 443 ssl; # managed by Certbot\n'
    '    ssl_certificate /etc/letsencrypt/live/sozodigicare.com/fullchain.pem; # managed by Certbot\n'
    '    ssl_certificate_key /etc/letsencrypt/live/sozodigicare.com/privkey.pem; # managed by Certbot\n'
    '    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot\n'
    '    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot\n'
    '\n'
    '}\n'
    '\n'
    'server {\n'
    '    if ($host = app.sozodigicare.com) {'
)

if old in content:
    content = content.replace(old, new, 1)
    with open('/etc/nginx/sites-enabled/sozodigicare', 'w') as f:
        f.write(content)
    print('SUCCESS: nginx config updated')
else:
    print('ERROR: pattern not found in config')
    sys.exit(1)
