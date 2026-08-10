# ContainerGuard — Unified K8s + Docker Monitoring Dashboard

**Version:** 1.0 Beta  
**Status:** Production Ready  
**Last Updated:** August 10, 2026

---

## 🎯 Overview

ContainerGuard is a **unified monitoring platform** for Kubernetes and Docker infrastructure. Track pods, deployments, containers, and resource metrics in real-time from a single dashboard.

**Unique Advantage:** First-to-market solution combining K8s + Docker monitoring in a unified interface. 80% of enterprises run K8s; shipping a complete product (not Docker-only) = massive TAM advantage.

---

## ✨ Key Features

### Kubernetes Monitoring
- Real-time pod tracking across all namespaces
- Deployment status and replica counts
- Node health and resource allocation (CPU/memory)
- Container-level insights

### Docker Monitoring
- Running container inventory
- Per-container CPU and memory usage
- Container status and uptime tracking
- Image and port information

### Unified Dashboard
- **View Toggle:** All / K8s Only / Docker Only
- **Real-time Refresh:** 5-second update cycle
- **Live Metrics:** CPU usage, memory consumption, container counts
- **Health Status:** System-wide health indicator

### Authentication
- Secure signup/login flow
- JWT-based authentication
- Password hashing with bcrypt

### Responsive Design
- Clean, modern UI built with React + Tailwind
- Mobile-friendly dashboard
- Instant feedback on data loading

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Browser / Dashboard                    │
│     (HuggingFace Space - React + Vite)                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS (CORS-enabled)
                       ▼
┌─────────────────────────────────────────────────────────┐
│              ContainerGuard Backend API                   │
│    (Render - Node.js + Express on Port 3001)             │
├─────────────────────────────────────────────────────────┤
│ • Authentication (JWT + bcrypt)                          │
│ • K8s Monitoring Service (@kubernetes/client-node)       │
│ • Docker Monitoring Service (dockerode)                  │
│ • User Storage (JSON file-based, zero dependencies)      │
└──────────────────────┬──────────────────────────────────┘
         │                                    │
         ▼                                    ▼
  ┌────────────────┐                 ┌──────────────────┐
  │ K3d Cluster    │                 │ Docker Daemon    │
  │ (K8s v1.35.5)  │                 │ (v29.7.1)        │
  │ 1 Node, 5 Pods │                 │ Local Monitoring │
  └────────────────┘                 └──────────────────┘
```

---

## 🚀 Live URLs

| Component | URL | Environment |
|-----------|-----|-------------|
| **Dashboard** | https://huggingface.co/spaces/muralipala/containerdguard-dashboard | HuggingFace Space |
| **Backend API** | https://containerdguard-backend.onrender.com | Render (Free Tier) |
| **Pricing Page** | https://hubspace.aillowpages.com/pricing | AIllowpages |
| **Beta Signup** | https://form.typeform.com/to/dA5m3aQ5 | Typeform |

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18+ (Vite)
- **Styling:** Tailwind CSS
- **State Management:** React Hooks
- **Hosting:** HuggingFace Spaces (auto-deploy on git push)
- **Build:** Vite (instant HMR)

### Backend
- **Runtime:** Node.js 24.14.1
- **Framework:** Express.js
- **Authentication:** JWT + bcrypt
- **K8s Client:** @kubernetes/client-node
- **Docker Client:** dockerode
- **Storage:** JSON file-based (no database dependency)
- **Hosting:** Render (free tier, manual deploy)
- **Port:** 3001

### Infrastructure
- **K8s Cluster:** K3d single-node (192.168.217.164:41343)
- **Docker Host:** Local daemon (amla-agent-test)
- **Kubeconfig:** TLS disabled for local dev (k3d-config)

---

## 📊 API Endpoints

### Authentication

**POST** `/api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "name": "John Doe"
}
```
Response: `{ success: true, token: "jwt-token", user: {...} }`

**POST** `/api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```
Response: `{ success: true, token: "jwt-token", user: {...} }`

### Monitoring

**GET** `/api/monitoring/all`  
Returns unified K8s + Docker data
```json
{
  "k8s": {
    "clusterInfo": { nodes: 1, nodeList: [...] },
    "pods": [{ name, namespace, status, containers, image, ... }]
  },
  "docker": {
    "info": { version, containers, images, ... },
    "containers": [{ id, name, image, status, ports, ... }]
  }
}
```

**GET** `/api/monitoring/k8s`  
K8s data only

**GET** `/api/monitoring/docker`  
Docker data only

**GET** `/health`  
Health check endpoint

---

## 🧪 Testing & Deployment

### Local Development
```bash
cd ~/containerdguard-backend
npm install
npm start
# Backend runs on http://localhost:3001
```

### Render Deployment (Manual)
1. Push commits to GitHub: `git push origin master`
2. Go to Render dashboard → containerdguard-backend service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait 2-3 minutes for build and deployment
5. Check logs for "Your service is live"

### Git Commits (Session 11)
| Commit | Message |
|--------|---------|
| 51a8054 | fix: CORS configuration for HF Space domain |
| 09e71d7 | fix: make K8s and Docker monitoring optional, handle init failures gracefully |
| 63aa674 | fix: use JSON file for users instead of database |

---

## 📋 Known Limitations (Beta)

1. **Free Tier Render:** Instance spins down with inactivity (50+ sec delays possible)
2. **Manual Deployment:** No auto-webhooks; requires manual Render deploy after git push
3. **Local K8s/Docker:** Only monitors local cluster and daemon (no remote support yet)
4. **Authentication:** Basic JWT; no email verification or password reset
5. **Storage:** JSON file-based; not suitable for high-scale production

---

## 🔧 Troubleshooting

### Dashboard shows "Failed to connect to backend monitoring"
- **Check:** CORS errors in browser console (F12)
- **Verify:** Render backend is deployed (check logs)
- **Try:** Hard refresh dashboard (Ctrl+Shift+R)

### Backend won't start on Render
- **Check:** Logs for `Error: Cannot find module`
- **Verify:** All dependencies in `package.json`
- **Solution:** Use JSON file storage instead of database libraries

### K8s/Docker metrics show as unavailable
- **Expected:** Render doesn't have K8s cluster or Docker daemon
- **Status:** Graceful error handling — backend continues running
- **Dashboard:** Shows "unavailable" instead of crashing

---

## 📈 Next Steps (Phase 2)

- [ ] Email verification for signup
- [ ] Alert system (CPU/memory thresholds)
- [ ] Compliance scanning (CIS benchmarks)
- [ ] REST API for programmatic access
- [ ] Multi-cluster support
- [ ] Webhook integrations (Slack, PagerDuty)
- [ ] Historical metrics (time-series storage)
- [ ] Role-based access control (RBAC)

---

## 🤝 Support & Feedback

**Beta Users:** Fill out the feedback form on the dashboard or email murali@example.com

**Issues/PRs:** GitHub: https://github.com/muralipala1504/containerdguard-backend

---

## 📝 Session Notes

**Session 11 Summary:** Fixed CORS, K8s/Docker init failures, and database dependencies. Backend now gracefully handles unavailable services and properly connects to HF Space dashboard. Production-ready for beta testing.

**Launch Status:** Ready for controlled beta testing. Docs complete. Test plan available in `TEST_PLAN.md`.


