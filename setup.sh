#!/bin/bash
apt-get update
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
PUBLIC_IP=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
apt-get install -y nodejs
apt-get install -y nginx
cd /var/www/
chmod -R 775 /var/www/
git clone https://github.com/psagar-dev/travel-memory.git
cd travel-memory/backend
echo "PORT=3000" > .env
echo "MONGO_URI=''" >> .env
npm install
npm install pm2 -g
pm2 start index.js --name "travel-memory-backend"
pm2 startup
pm2 save
cd ..
cd frontend
echo "REACT_APP_BACKEND_URL=http://$PUBLIC_IP" > .env
npm install
npm run build
cp -r build/* /var/www/html/
rm /etc/nginx/sites-enabled/default
bash -c 'cat > /etc/nginx/sites-available/travel-memory << EOF
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'
ln -s /etc/nginx/sites-available/travel-memory /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx