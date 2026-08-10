# ContainerGuard User Guide

**Version:** 1.0 Beta  
**Last Updated:** August 10, 2026

Welcome to ContainerGuard! This guide will help you get started monitoring your Kubernetes and Docker infrastructure.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Authentication](#authentication)
4. [Monitoring Views](#monitoring-views)
5. [Understanding Metrics](#understanding-metrics)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

---

## Getting Started

### Step 1: Access the Dashboard

Open your browser and navigate to:
```
https://huggingface.co/spaces/muralipala/containerdguard-dashboard
```

### Step 2: Create an Account (First Time)

1. Click **"Sign Up"** on the login page
2. Fill in:
   - **Email:** Your email address
   - **Name:** Your full name or username
   - **Password:** A secure password (min 8 characters recommended)
3. Click **"Create Account"**
4. You'll be logged in automatically

### Step 3: First Look at the Dashboard

After login, you should see:
- **Welcome banner** at the top
- **View toggle buttons:** All / Kubernetes / Docker
- **Metrics cards:** Running Containers, CPU Usage, Memory, Health Status
- **Data sections:** Pod/Container listings with details

---

## Dashboard Overview

### Layout

```
┌─────────────────────────────────────────────────┐
│  ContainerGuard Dashboard                       │
│  Welcome, [Your Name]!                          │
├─────────────────────────────────────────────────┤
│  [All (0)]  [Kubernetes (0)]  [Docker (0)]     │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │Running   │  │Total CPU │  │Total     │     │
│  │Containers│  │Usage     │  │Memory    │     │
│  │    0     │  │   0.0%   │  │   0 MB   │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│  ┌──────────────────────────────────────┐     │
│  │Health Status: Healthy ✓              │     │
│  └──────────────────────────────────────┘     │
├─────────────────────────────────────────────────┤
│  K8s Pods / Docker Containers List              │
│  (Updated every 5 seconds)                      │
└─────────────────────────────────────────────────┘
```

### Key Elements

| Element | Purpose |
|---------|---------|
| **Welcome Banner** | Personalized greeting with your name |
| **View Toggles** | Switch between All/K8s/Docker monitoring |
| **Metrics Cards** | Quick overview of resource usage |
| **Health Status** | System-wide health indicator |
| **Resource List** | Detailed pod/container information |

---

## Authentication

### Login

1. Go to https://huggingface.co/spaces/muralipala/containerdguard-dashboard
2. Enter **Email** and **Password**
3. Click **"Login"**
4. You'll be redirected to the dashboard

**Note:** Your session is stored as a JWT token in your browser. Don't share this token!

### Logout

1. Click **"Logout"** button (top right of dashboard)
2. You'll be redirected to the login page

### Password Security

- Use a strong password (mix of uppercase, lowercase, numbers, symbols)
- Never share your password
- ContainerGuard stores passwords hashed (never plaintext)

**Future Feature:** Password reset will be added in Phase 2

---

## Monitoring Views

### All View (Default)

Shows both Kubernetes and Docker infrastructure in one unified dashboard.

**Best For:** Getting a complete picture of your entire infrastructure

**What You See:**
- K8s cluster info (nodes, resources)
- All K8s pods across all namespaces
- Docker container inventory
- Unified metrics (CPU, memory, health)

**Example Screenshot:**
```
All (0)  [Kubernetes (0)]  [Docker (0)]
│
├─ Running Containers: 0
├─ Total CPU Usage: 0.0%
├─ Total Memory: 0 MB
├─ Health Status: Healthy
│
├─ K8s Pods:
│  ├─ coredns (kube-system) - Running
│  ├─ metrics-server (kube-system) - Running
│  └─ traefik (kube-system) - Running
│
└─ Docker Containers:
   └─ autonomous-agent - Exited
```

---

### Kubernetes View

Shows only Kubernetes infrastructure.

**Best For:** Focused K8s cluster monitoring and debugging

**What You See:**
- **Cluster Info:**
  - Number of nodes
  - CPU allocatable
  - Memory allocatable
  - Kubelet version

- **Pod List:**
  - Pod name
  - Namespace
  - Status (Running, Pending, Failed, etc.)
  - Container count
  - Container image(s)
  - Restart count
  - Creation timestamp

**How to Use:**
1. Click **"Kubernetes"** tab
2. Review cluster capacity
3. Scroll to pod list
4. Identify any pods with issues (status != Running)
5. Check restart counts (high = potential problems)

---

### Docker View

Shows only Docker container infrastructure.

**Best For:** Local Docker container monitoring and management

**What You See:**
- **Docker Info:**
  - Docker version
  - Total container count
  - Running containers count
  - Stopped containers count
  - Image count
  - Architecture

- **Container List:**
  - Container name
  - Image name
  - Status (Running, Exited, Paused, etc.)
  - Ports exposed
  - Container ID

**How to Use:**
1. Click **"Docker"** tab
2. Review Docker version and stats
3. Scroll to container list
4. Monitor container statuses
5. Identify stopped containers that should be running

---

## Understanding Metrics

### Running Containers

**What It Means:** Total number of containers currently running (K8s pods + Docker containers)

**Interpretation:**
- **Value: 0** — No containers running (may indicate stopped infrastructure)
- **Value: > 0** — Infrastructure is active
- **Rising/Falling** — Dynamic resource scaling

**Action Items:**
- If lower than expected: Check why pods/containers stopped
- If higher than expected: Verify no runaway deployments

---

### Total CPU Usage

**What It Means:** Percentage of available CPU being consumed

**Interpretation:**
- **0-30%** — Low resource usage (healthy)
- **30-70%** — Moderate usage (normal operation)
- **70-90%** — High usage (monitor closely)
- **>90%** — Critical (risk of throttling)

**Action Items:**
- If consistently high: Consider scaling up resources
- If spikes: Investigate which pods/containers using CPU
- If unexpected: Check for memory leaks or runaway processes

---

### Total Memory

**What It Means:** Total RAM consumed by all containers

**Interpretation:**
- **Low** — Most memory still available
- **Moderate** — Steady consumption (normal)
- **High** — Risk of OOM (Out of Memory) errors
- **Growing** — Potential memory leak

**Action Items:**
- If growing over time: Check for memory leaks
- If consistently high: Scale up available memory
- If near maximum: Critical — risk of crashes

---

### Health Status

**What It Means:** Overall system health indicator

**Possible States:**
- **Healthy ✓** — All systems operational
- **Warning ⚠️** — Some issues detected (less than 50% pods healthy)
- **Critical ✗** — Major issues (more than 50% pods down)

**Interpretation:**
- **Healthy:** No action needed
- **Warning:** Investigate which pods are unhealthy
- **Critical:** Immediate action required

---

## Common Tasks

### Monitor Pod Status

**Goal:** Check if all Kubernetes pods are running

**Steps:**
1. Click **"Kubernetes"** tab
2. Scroll to Pod List section
3. Look for any pods with status != "Running"
4. Unhealthy pods show different colors:
   - 🟢 Green = Running
   - 🟡 Yellow = Pending
   - 🔴 Red = Failed/Crashed
   - ⚫ Gray = Unknown

**What to Do If Pod Is Down:**
- Check logs (outside dashboard, in kubectl)
- Verify resource availability
- Check for failed dependencies
- Review container image availability

---

### Check Resource Usage by Container

**Goal:** Identify which container is using most CPU/memory

**Steps (K8s):**
1. Click **"Kubernetes"** tab
2. Look at each pod's metrics
3. Compare container counts and images
4. Heavy-use images may indicate resource hogs

**Steps (Docker):**
1. Click **"Docker"** tab
2. Review container list
3. Containers with "Running" status are actively using resources
4. Containers with "Exited" status are not consuming resources

---

### Verify K8s Cluster Health

**Goal:** Ensure cluster is fully operational

**Steps:**
1. Click **"Kubernetes"** tab
2. Check **Cluster Info:**
   - Nodes count (should be > 0)
   - CPU available (should be > 0)
   - Memory available (should be > 0)
3. Check **Pod List:**
   - Most pods should be "Running"
   - Restart count should be low (0-2 is normal)
4. Check **Health Status:** Should show "Healthy"

**If Unhealthy:**
- Note which pods are down
- Check their namespaces
- Investigate using kubectl logs

---

### Monitor Docker Containers

**Goal:** Keep track of Docker container lifecycle

**Steps:**
1. Click **"Docker"** tab
2. Review **Docker Info:**
   - Total containers (expected count)
   - Running count (should match expected)
   - Version (verify it's current)
3. Check **Container List:**
   - Running containers should be "Running"
   - Expected containers should be present
   - No unexpected containers

**If Container Is Stopped:**
- Verify if it should be running
- Check restart policy
- Review container logs (outside dashboard)

---

## Troubleshooting

### Dashboard Won't Load

**Problem:** Page shows blank or "Loading..." indefinitely

**Solutions:**
1. **Hard refresh:** Press Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear cache:** F12 → Storage → Clear site data
3. **Check internet:** Verify network connection
4. **Check backend:** Visit https://containerdguard-backend.onrender.com/health
   - Should show `{"status": "healthy", "service": "containerdguard-backend"}`

---

### "Failed to Connect to Backend Monitoring"

**Problem:** Dashboard loads but shows error message

**Possible Causes:**
1. Backend service is down
2. Network connectivity issue
3. Browser CORS settings

**Solutions:**
1. Wait 1-2 minutes (Render free tier may be waking up)
2. Refresh page (F5)
3. Check browser console (F12 → Console)
4. If error persists 5+ minutes: Backend may need restart
   - Email murali@example.com or file feedback in dashboard

---

### No Data Showing (All Metrics are 0)

**Problem:** Dashboard loads but all metrics show 0

**Possible Causes:**
1. K8s cluster or Docker daemon not running
2. Monitoring services not connected
3. First-time load (may take 5-10 seconds)

**Solutions:**
1. **Wait 10 seconds:** Data may still be loading
2. **Refresh:** Press F5
3. **Switch views:** Try clicking All → K8s → Docker (may trigger refresh)
4. **Check backend logs:** If persists, backend may have connection issues

**Note:** Beta limitation — K8s/Docker services only work on specific infrastructure. Render doesn't have access to your local cluster, so metrics may show as unavailable. This is expected and will be addressed in Phase 2.

---

### Can't Log In

**Problem:** Login fails or stuck on login page

**Possible Causes:**
1. Incorrect email/password
2. Account doesn't exist
3. Backend down

**Solutions:**
1. **Verify credentials:** Double-check email and password (case-sensitive)
2. **Try signup:** If account doesn't exist, click "Sign Up"
3. **Wait 1-2 minutes:** Backend may be starting (Render free tier)
4. **Contact support:** If still failing, email murali@example.com

---

### Metrics Update Too Slowly or Not At All

**Problem:** Dashboard refreshes every 5 seconds but data seems stale

**Possible Causes:**
1. Network latency
2. Backend under load
3. Browser cache issues

**Solutions:**
1. **Hard refresh:** Ctrl+Shift+R
2. **Check network:** F12 → Network → Look for API calls
3. **Wait for refresh:** Dashboard updates every ~5 seconds automatically
4. **If still slow:** Your infrastructure may be under load

---

## FAQ

### Q: Is my data secure?

**A:** Yes. ContainerGuard uses:
- JWT tokens for authentication (stored in browser only)
- HTTPS for all communication
- Password hashing with bcrypt (passwords never stored plaintext)
- No third-party tracking

**Note:** This is a beta product. Review our privacy policy before using in production.

---

### Q: Can I monitor multiple clusters?

**A:** Not yet. Phase 2 feature. Current version monitors one K8s cluster and one Docker daemon.

---

### Q: How often are metrics updated?

**A:** Dashboard auto-refreshes every 5 seconds. Metrics reflect the current state of your infrastructure.

---

### Q: Can I export metrics?

**A:** Not yet. Phase 2 feature. Currently viewing only. Future versions will support CSV export and historical trending.

---

### Q: What if I forget my password?

**A:** Password reset is coming in Phase 2. For now:
1. Create a new account with a different email
2. Contact murali@example.com for account recovery

---

### Q: Is there a mobile app?

**A:** Not yet. The dashboard is responsive and works on mobile browsers. Native apps planned for Phase 2.

---

### Q: Can I set up alerts?

**A:** Not yet. Alert system comes in Phase 2. For now, you must manually monitor the dashboard.

---

### Q: How much does this cost?

**A:** Beta is free while we gather feedback. Pricing plans coming with Phase 2. See https://hubspace.aillowpages.com/pricing for planned tiers.

---

### Q: What's the roadmap?

**A:** Phase 2 includes:
- Multi-cluster support
- Alert system (CPU/memory thresholds)
- Compliance scanning
- REST API for programmatic access
- Historical metrics & trends
- Webhook integrations (Slack, PagerDuty)
- Mobile app

---

### Q: I found a bug. How do I report it?

**A:** 
1. **In-app:** Use the feedback form on the dashboard
2. **GitHub:** https://github.com/muralipala1504/containerdguard-backend/issues
3. **Email:** murali@example.com

Include:
- Description of the issue
- Steps to reproduce
- Screenshots if possible
- Your browser/OS

---

### Q: Can I self-host ContainerGuard?

**A:** Yes! Source code is on GitHub: https://github.com/muralipala1504/containerdguard-backend

Instructions for self-hosting coming in Phase 2 docs.

---

## Getting Help

### Support Channels

- **Email:** murali@example.com
- **GitHub Issues:** https://github.com/muralipala1504/containerdguard-backend/issues
- **Dashboard Feedback:** Built-in feedback form
- **Typeform:** https://form.typeform.com/to/dA5m3aQ5 (beta signup questions)

### Response Time

- **Critical bugs:** 24 hours
- **Feature requests:** Best effort (Phase 2 planning)
- **General questions:** 48 hours

---

## Tips & Tricks

### Tip 1: Use View Toggles Strategically

- **All:** Daily monitoring and overview
- **Kubernetes:** Debugging pod issues
- **Docker:** Managing local development containers

### Tip 2: Monitor Restart Counts

High restart counts indicate:
- Memory leaks
- Crashes
- Resource constraints
- Configuration issues

### Tip 3: Correlate CPU and Memory

- CPU spike + memory spike = possible runaway process
- CPU spike without memory increase = compute-intensive task
- Memory growth without CPU = memory leak

### Tip 4: Check Health Status Regularly

Set a reminder to check the health status daily. Don't wait for alerts (coming Phase 2).

### Tip 5: Keep Bookmarks

Bookmark these URLs:
- Dashboard: https://huggingface.co/spaces/muralipala/containerdguard-dashboard
- Backend: https://containerdguard-backend.onrender.com/health
- Pricing: https://hubspace.aillowpages.com/pricing

---

## Feedback

Help us improve! After testing, please fill out:
https://form.typeform.com/to/dA5m3aQ5

We'd love to hear about:
- Features you need most
- Bugs you encountered
- Performance feedback
- UI/UX improvements

---

**Thank you for using ContainerGuard Beta! 🚀**


