# eNom Domain Search Proxy Server

This proxy server provides a static IP address solution for eNom domain availability checks, bypassing the rotating IP limitation of Supabase Edge Functions.

## Architecture

```
Supabase Edge Function → Proxy Server (Static IP) → eNom API
```

## Quick Start

### 1. Deploy to a VPS with Static IP

**Recommended providers:**
- DigitalOcean Droplets ($6/month)
- AWS EC2 t2.micro (Free tier eligible)
- Linode Shared CPU ($5/month)
- Vultr Cloud Compute ($6/month)

### 2. Install Dependencies

```bash
# SSH into your VPS
ssh user@your-server-ip

# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Create project directory
mkdir enom-proxy
cd enom-proxy

# Copy the files (index.js, package.json, .env.example)
# Then install dependencies
npm install
```

### 3. Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

Add your values:
```
ENOM_API_USER=your_enom_username
ENOM_API_TOKEN=your_enom_api_token
PROXY_API_KEY=generate_a_secure_random_key_here
PORT=3000
```

**Important:** Generate a secure random API key for `PROXY_API_KEY`. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Whitelist Your Server IP in eNom

1. Find your server's IP address: `curl ifconfig.me`
2. Log into eNom reseller account
3. Go to Settings → API Settings → IP Whitelist
4. Add your server's IP address

### 5. Start the Server

**For testing:**
```bash
npm start
```

**For production (with PM2):**
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the server
pm2 start index.js --name enom-proxy

# Set to start on system reboot
pm2 startup
pm2 save
```

### 6. Set Up Firewall (Optional but Recommended)

```bash
# Allow SSH
sudo ufw allow 22

# Allow your proxy port
sudo ufw allow 3000

# Enable firewall
sudo ufw enable
```

### 7. Configure Supabase

Add these secrets to your Supabase project:

1. `DOMAIN_PROXY_URL`: `http://your-server-ip:3000` (already added)
2. `DOMAIN_PROXY_API_KEY`: The same key you used in `.env`

## Testing

Test the proxy server:

```bash
# Health check
curl http://your-server-ip:3000/health

# Domain check (replace YOUR_API_KEY)
curl -X POST http://your-server-ip:3000/check-domain \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"domain": "example", "tld": ".com"}'
```

## Production Considerations

### SSL/HTTPS (Recommended)

For production, use HTTPS with a reverse proxy:

1. Install Nginx:
```bash
sudo apt install nginx
```

2. Install Certbot for SSL:
```bash
sudo apt install certbot python3-certbot-nginx
```

3. Configure Nginx reverse proxy:
```bash
sudo nano /etc/nginx/sites-available/enom-proxy
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. Enable site and get SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/enom-proxy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo certbot --nginx -d your-domain.com
```

Then update `DOMAIN_PROXY_URL` in Supabase to `https://your-domain.com`

### Monitoring

Monitor your proxy server with PM2:

```bash
# View logs
pm2 logs enom-proxy

# Monitor status
pm2 status

# Restart if needed
pm2 restart enom-proxy
```

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

Then add to `index.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/check-domain', limiter);
```

## Troubleshooting

**Proxy server not responding:**
- Check if server is running: `pm2 status`
- Check logs: `pm2 logs enom-proxy`
- Verify firewall: `sudo ufw status`

**eNom API errors:**
- Verify IP is whitelisted in eNom
- Check eNom credentials in `.env`
- Review proxy logs for error details

**Authentication errors:**
- Ensure `PROXY_API_KEY` matches between server and Supabase secret
- Check `x-api-key` header is being sent

## Cost Estimate

- VPS hosting: $5-6/month
- Domain (optional for SSL): $10-15/year
- Total: ~$6-8/month

## Support

For issues, check:
1. Server logs: `pm2 logs enom-proxy`
2. Supabase edge function logs
3. Network connectivity between services
