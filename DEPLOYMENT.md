# Production Deployment Guide: ApexAudit

This guide documents the production deployment architecture, build commands, environment configuration, and hosting strategies for **ApexAudit**.

---

## 1. System Architecture & Hosting Strategy

ApexAudit is structured as a decoupled monorepo composed of a **Next.js 16 App Router** frontend and a **FastAPI (Python 3.12)** backend.

```
                     ┌────────────────────────────────┐
                     │         Client Browser         │
                     └───────────────┬────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 │                                       │
                 ▼ (HTTPS / HTML / SSR)                  ▼ (HTTPS / JSON API)
     ┌───────────────────────┐               ┌───────────────────────┐
     │   Frontend Service    │               │    Backend Service    │
     │  (Next.js App Router) │               │   (FastAPI / Uvicorn) │
     │  Vercel / Node Runner │               │ Render / Railway / VPS│
     └───────────────────────┘               └───────────┬───────────┘
                                                         │
                                             ┌───────────┴───────────┐
                                             ▼                       ▼
                                  ┌─────────────────────┐ ┌─────────────────────┐
                                  │  Google Gemini API  │ │ External Web Sources│
                                  │ (Live LLM Analysis) │ │  (URL Ingestion)    │
                                  └─────────────────────┘ └─────────────────────┘
```

### Recommended Hosting Topologies

| Component | Recommended Platform | Alternative Platforms | Runtime |
| :--- | :--- | :--- | :--- |
| **Frontend** (`frontend/`) | **Vercel** (Zero-config Next.js) | Cloudflare Pages, AWS Amplify, Docker on VPS | Node.js 20+ LTS |
| **Backend** (`backend/`) | **Render / Railway** | AWS ECS, Fly.io, DigitalOcean VPS (systemd + Nginx) | Python 3.12+ |
| **All-in-One** | **Docker Compose on Linux VPS** | Single Hetzner / AWS EC2 instance | Docker Engine |

---

## 2. Environment Variables & Secrets Management

### Frontend Configuration (`frontend/.env.local` or Cloud Settings)

| Variable | Required | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://127.0.0.1:8000/api` | Base URL pointing to the active FastAPI backend API routes. | `https://api.apexaudit.yourdomain.com/api` |
| `BUILD_STANDALONE` | Optional | `false` | When set to `true`, generates `.next/standalone` for lightweight Docker images. | `true` |

### Backend Configuration (`backend/.env` or Cloud Settings)

| Variable | Required | Default | Description | Example |
| :--- | :---: | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Recommended** | `None` | Google Gemini API key used for live pre-mortem blueprint generation and claim extraction. | `AIzaSy...` |
| `GEMINI_MODEL` | Optional | `gemini-3.5-flash` | Gemini model variant. Supports `gemini-3.5-flash` or `gemini-2.5-flash`. | `gemini-3.5-flash` |
| `ALLOWED_ORIGINS` | **Yes (Prod)** | `http://localhost:3000...` | Comma-separated list of allowed CORS origins for browser fetch requests. | `https://apexaudit.yourdomain.com,https://app.yourdomain.com` |
| `PORT` | Optional | `8000` | Port for the Uvicorn web server to bind to (assigned dynamically by Render/Railway). | `8000` |
| `HOST` | Optional | `0.0.0.0` | IP binding address for Uvicorn. | `0.0.0.0` |

### Security & Secrets Rules
1. **Never Commit Secrets**: Ensure `backend/.env`, `frontend/.env.local`, and root `.env` are listed in `.gitignore`.
2. **Key Masking**: Never expose `GEMINI_API_KEY` to the client-side bundle (never prefix with `NEXT_PUBLIC_`).
3. **CORS Isolation**: In production, set `ALLOWED_ORIGINS` explicitly to your production frontend domain to reject unauthorized origins.
4. **Resilient Offline Fallback**: If `GEMINI_API_KEY` is omitted, hits a quota exhaustion (429), or is invalid, the backend automatically and seamlessly degrades to pre-cached demo fixtures (`demo_csss.json`) with zero service interruption.

---

## 3. Build & Start Commands

### Frontend (`frontend/`)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install production dependencies
npm ci

# 3. Compile optimized Next.js App Router production build
npm run build

# 4. Start production server (runs on port 3000 by default)
npm start -- -p 3000
```

### Backend (`backend/`)

```bash
# 1. Navigate to backend
cd backend

# 2. Set up clean Python virtual environment
python3.12 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 4. Start production Uvicorn server with multiple worker processes
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips='*'
```

---

## 4. Hosting Platform Deployment Guides

### Option A: Vercel (Frontend) + Render / Railway (Backend) — *Recommended*

#### Deploying Backend on Render
1. Create a **New Web Service** connected to your Git repository.
2. Configure settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2 --proxy-headers`
3. Add Environment Variables:
   - `GEMINI_API_KEY`: `<your_gemini_api_key>`
   - `GEMINI_MODEL`: `gemini-3.5-flash`
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
4. Set Health Check Path: `/health`.

#### Deploying Frontend on Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Next.js`.
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-service.onrender.com/api`
5. Click **Deploy**.

---

### Option B: Dedicated Linux VPS (Ubuntu / Debian) with systemd & Nginx

#### 1. Backend systemd Service (`/etc/systemd/system/apexaudit-backend.service`)
```ini
[Unit]
Description=ApexAudit FastAPI Backend
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/apexaudit/backend
Environment="PATH=/var/www/apexaudit/backend/venv/bin"
EnvironmentFile=/var/www/apexaudit/backend/.env
ExecStart=/var/www/apexaudit/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 3 --proxy-headers

Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable apexaudit-backend
sudo systemctl start apexaudit-backend
```

#### 2. Frontend systemd Service / PM2
```bash
# Using PM2 for Next.js SSR
cd /var/www/apexaudit/frontend
npm ci
npm run build
pm2 start npm --name "apexaudit-frontend" -- start -- -p 3000
pm2 save
pm2 startup
```

#### 3. Nginx Reverse Proxy Configuration (`/etc/nginx/sites-available/apexaudit`)
```nginx
server {
    listen 80;
    server_name apexaudit.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name apexaudit.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/apexaudit.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/apexaudit.yourdomain.com/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Next.js Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # FastAPI Backend Routes
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Extended timeouts for scraping / LLM generation
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Backend Health Check
    location /health {
        proxy_pass http://127.0.0.1:8000/health;
    }
}
```

Enable site and generate SSL:
```bash
sudo ln -s /etc/nginx/sites-available/apexaudit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d apexaudit.yourdomain.com
```

---

### Option C: Containerized Deployment (Docker & Docker Compose)

The repository includes a ready-to-use [`docker-compose.yml`](file:///c:/Users/DELL/Desktop/Blindspot/docker-compose.yml), [`backend/Dockerfile`](file:///c:/Users/DELL/Desktop/Blindspot/backend/Dockerfile), and [`frontend/Dockerfile`](file:///c:/Users/DELL/Desktop/Blindspot/frontend/Dockerfile).

#### 1. Configure Production Environment
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
ALLOWED_ORIGINS=http://localhost:3000,https://apexaudit.yourdomain.com
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

#### 2. Build and Launch
```bash
# Build multi-stage images and start in background
docker compose up --build -d

# Check live service health
docker compose ps
```

---

## 5. Database, In-Memory State & Caching Architecture

1. **Stateless Core Pipeline**:
   The verification engine is entirely stateless. Requests pass through:
   `Goal + Blueprint + Sources` $\rightarrow$ `Strict Verbatim Extraction` $\rightarrow$ `Conflict Detector` $\rightarrow$ `Scoring Engine`.
   No persistent database (PostgreSQL/MongoDB) is required for core decision evaluations.

2. **Client-Side Session State**:
   All working session data (editable blueprint items, user-added sources, and marked verification checkboxes) resides in the client state. State updates immediately trigger dynamic recalculation.

3. **In-Memory LRU Extraction Cache**:
   In `backend/app/services/claim_extractor.py`, atomic claim extractions are cached based on SHA-256 hashes of the source raw text and aspect IDs. This prevents redundant LLM calls, reduces token burn by up to 80%, and stays well within Gemini free-tier rate limits (5-15 RPM).

4. **Resilient Offline Fallback Fixtures**:
   If the Gemini API encounters rate limits (429) or timeouts, the engine automatically falls back to `backend/app/data/demo_csss.json`. The user experiences zero interruption or crash.

---

## 6. Health Checks & Zero-Downtime Monitoring

| Endpoint | Method | Expected Status | Description |
| :--- | :---: | :---: | :--- |
| `https://api.yourdomain.com/health` | `GET` | `200 OK` (`{"status": "healthy"}`) | Primary uptime probe for load balancers and Render/Railway monitors. |
| `https://api.yourdomain.com/` | `GET` | `200 OK` | Service metadata probe confirming API version and status. |
| `https://yourdomain.com/` | `GET` | `200 OK` | Frontend availability probe. |

### Recommended Monitoring Setups
- **UptimeRobot / Better Uptime**: Configure 60-second HTTP probes on `/health` and frontend root.
- **Alert Conditions**: Notify Slack/Discord if response time exceeds 5,000ms or status is not `200`.

---

## 7. Production Pre-Flight Checklist

Before public release, verify each item:

- [ ] **Secrets Audit**: `GEMINI_API_KEY` is saved in cloud environment variables, not committed in code.
- [ ] **CORS Configuration**: `ALLOWED_ORIGINS` includes your production frontend domain (e.g. `https://apexaudit.yourdomain.com`).
- [ ] **API URL Configuration**: `NEXT_PUBLIC_API_URL` points to `https://api.yourdomain.com/api`.
- [ ] **Build Validation**: `cd frontend && npm run build` compiles with 0 errors.
- [ ] **E2E Integration Verification**: `python backend/test_e2e_integration.py` passes all 6 tests.
- [ ] **Report Export Verification**: `python backend/test_export.py` passes all Markdown export tests.
- [ ] **SSL/TLS Certificates**: Active HTTPS on both frontend and backend domains.
- [ ] **Print Styles**: Verify that triggering Print (Ctrl+P) on `http://localhost:3000` renders a clean, high-contrast A4 executive document.
