# MCP Deployment Guide for Applaa

## Toggle Switch Fix ✅

**Issue Resolved**: The MCP toggle switch wasn't working because `enableMCP` wasn't defined in the `UserSettingsSchema`.

**Fix Applied**:

- Added `enableMCP: z.boolean().optional()` to `src/lib/schemas.ts`
- Updated test components to properly handle state management
- Toggle now works correctly and persists settings

## MCP Server Deployment Options

### 1. **Local Development (Recommended for Testing)**

**No VPS Required** - MCP servers run locally on your development machine.

```bash
# Install MCP servers locally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-web-search

# Run servers locally
mcp-server-filesystem --port 3001
mcp-server-git --port 3002
mcp-server-web-search --port 3003
```

**Pros**:

- ✅ No additional infrastructure costs
- ✅ Fast development and testing
- ✅ Full control over server configuration
- ✅ No network latency

**Cons**:

- ❌ Limited to single developer
- ❌ No shared state across team
- ❌ Requires local resources

### 2. **VPS Deployment (Recommended for Production)**

**VPS Required** - Deploy MCP servers on a Virtual Private Server for production use.

#### **Minimum VPS Requirements**:

```
CPU: 2 vCPUs
RAM: 4GB
Storage: 20GB SSD
OS: Ubuntu 20.04+ / CentOS 8+
Network: 1Gbps
```

#### **Recommended VPS Providers**:

- **DigitalOcean**: $20/month (2 vCPU, 4GB RAM)
- **Linode**: $24/month (2 vCPU, 4GB RAM)
- **AWS EC2**: t3.medium (~$30/month)
- **Google Cloud**: e2-medium (~$25/month)
- **Vultr**: $24/month (2 vCPU, 4GB RAM)

#### **VPS Setup Script**:

```bash
#!/bin/bash
# MCP Server VPS Setup

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install MCP servers
sudo npm install -g @modelcontextprotocol/server-filesystem
sudo npm install -g @modelcontextprotocol/server-git
sudo npm install -g @modelcontextprotocol/server-web-search
sudo npm install -g @modelcontextprotocol/server-github

# Create MCP configuration
mkdir -p /opt/mcp
cat > /opt/mcp/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mcp-filesystem',
      script: 'mcp-server-filesystem',
      args: '--port 3001 --host 0.0.0.0',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mcp-git',
      script: 'mcp-server-git',
      args: '--port 3002 --host 0.0.0.0',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'mcp-web-search',
      script: 'mcp-server-web-search',
      args: '--port 3003 --host 0.0.0.0',
      env: {
        NODE_ENV: 'production',
        SEARCH_API_KEY: 'your-search-api-key'
      }
    }
  ]
};
EOF

# Start MCP servers with PM2
cd /opt/mcp
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Configure firewall
sudo ufw allow 22
sudo ufw allow 3001:3003/tcp
sudo ufw --force enable

# Install Nginx for reverse proxy
sudo apt install -y nginx
cat > /etc/nginx/sites-available/mcp << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location /mcp/filesystem {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /mcp/git {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /mcp/web-search {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

### 3. **Docker Deployment (Scalable Option)**

**VPS or Cloud Required** - Containerized deployment for easy scaling.

```dockerfile
# Dockerfile for MCP servers
FROM node:18-alpine

WORKDIR /app

# Install MCP servers
RUN npm install -g @modelcontextprotocol/server-filesystem \
                   @modelcontextprotocol/server-git \
                   @modelcontextprotocol/server-web-search

# Copy configuration
COPY mcp-config.json .

EXPOSE 3001 3002 3003

# Start script
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  mcp-filesystem:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MCP_SERVER=filesystem
      - MCP_PORT=3001
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  mcp-git:
    build: .
    ports:
      - "3002:3002"
    environment:
      - MCP_SERVER=git
      - MCP_PORT=3002
    volumes:
      - ./repos:/app/repos
    restart: unless-stopped

  mcp-web-search:
    build: .
    ports:
      - "3003:3003"
    environment:
      - MCP_SERVER=web-search
      - MCP_PORT=3003
      - SEARCH_API_KEY=${SEARCH_API_KEY}
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - mcp-filesystem
      - mcp-git
      - mcp-web-search
    restart: unless-stopped
```

### 4. **Cloud Functions (Serverless)**

**No VPS Required** - Use serverless functions for specific MCP operations.

```javascript
// AWS Lambda / Vercel Function example
export default async function handler(req, res) {
  const { action, params } = req.body;

  switch (action) {
    case "filesystem":
      return handleFileSystemOperation(params);
    case "git":
      return handleGitOperation(params);
    case "web-search":
      return handleWebSearchOperation(params);
    default:
      return res.status(400).json({ error: "Unknown action" });
  }
}
```

## **Recommendation for Applaa**

### **Development Phase**: Local MCP Servers

- No VPS needed
- Use local installation for development and testing
- Cost: $0

### **Production Phase**: VPS Deployment

- **Recommended**: DigitalOcean Droplet ($20/month)
- 2 vCPU, 4GB RAM, 80GB SSD
- Ubuntu 22.04 LTS
- Managed with PM2 and Nginx

### **Enterprise Phase**: Kubernetes/Docker Swarm

- Auto-scaling based on demand
- High availability with load balancing
- Cost: $50-200/month depending on usage

## **Security Considerations**

```bash
# SSL/TLS Setup with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# API Key Management
export MCP_API_KEY="your-secure-api-key"
export MCP_SECRET_KEY="your-secret-key"

# Firewall Rules
sudo ufw deny 3001:3003/tcp  # Block direct access
sudo ufw allow 'Nginx Full'   # Allow only through Nginx
```

## **Monitoring and Maintenance**

```bash
# PM2 Monitoring
pm2 monit

# Log Management
pm2 logs mcp-filesystem --lines 100

# Health Checks
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health

# Automated Backups
crontab -e
# Add: 0 2 * * * /opt/mcp/backup.sh
```

## **Cost Summary**

| Deployment Type | Monthly Cost | Pros                   | Cons              |
| --------------- | ------------ | ---------------------- | ----------------- |
| Local           | $0           | Free, Fast             | Single developer  |
| VPS Basic       | $20-30       | Shared, Reliable       | Manual management |
| VPS Managed     | $50-100      | Automated, Scalable    | Higher cost       |
| Cloud Functions | $10-50       | Serverless, Auto-scale | Cold starts       |
| Enterprise      | $200+        | High availability      | Complex setup     |

## **Answer: Do You Need a VPS?**

**For Development**: ❌ **No VPS needed** - Use local MCP servers
**For Production**: ✅ **Yes, VPS recommended** - $20-30/month for reliable service
**For Enterprise**: ✅ **Yes, managed infrastructure** - $50+ for high availability

The toggle switch is now fixed and will properly enable/disable MCP functionality in your Applaa application!
