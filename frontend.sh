#!/bin/bash
apt-get update
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs
apt-get install -y nginx
cd /var/www/
chmod -R 775 /var/www/
git clone https://github.com/psagar-dev/travel-memory.git
cd travel-memory/frontend
echo "REACT_APP_BACKEND_URL=http://tmapi.patelsagar.com" > .env
npm install
npm run build
cp -r build/* /var/www/html/
rm /etc/nginx/sites-enabled/default
bash -c 'cat > /etc/nginx/sites-available/tm.patelsagar.com << EOF
server {
    listen 80;
    server_name _;

    root /var/www/html;
    index index.html;

    location ~ /\.(?!well-known).* {
        deny all;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF'
ln -s /etc/nginx/sites-available/tm.patelsagar.com /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
systemctl restart nginx