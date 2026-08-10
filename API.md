# ContainerGuard API Documentation

**Base URL:** `https://containerdguard-backend.onrender.com`  
**Version:** 1.0 Beta  
**Authentication:** JWT (Bearer token in Authorization header)

---

## Table of Contents
1. [Authentication](#authentication)
2. [Monitoring](#monitoring)
3. [Health & Status](#health--status)
4. [Error Handling](#error-handling)
5. [Rate Limits](#rate-limits)
6. [Example Workflows](#example-workflows)

---

## Authentication

### POST /api/auth/register

Create a new user account.

**Request:**
```bash
curl -X POST https://containerdguard-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password-123",
    "name": "John Doe"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` — Missing required fields (email, password, name)
- `400 Bad Request` — Email already exists (duplicate signup)

**Status:** ✅ Working (tested with test5 user)

---

### POST /api/auth/login

Authenticate and get JWT token.

**Request:**
```bash
curl -X POST https://containerdguard-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "secure-password-123"
  }'
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses:**
- `400 Bad Request` — Missing email or password
- `401 Unauthorized` — Invalid credentials
- `403 Forbidden` — Email not verified (future feature)

**Status:** ✅ Working (tested with test5 user)

---

## Monitoring

### GET /api/monitoring/all

Get unified K8s + Docker monitoring data.

**Request:**
```bash
curl -X GET https://containerdguard-backend.onrender.com/api/monitoring/all \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "k8s": {
    "clusterInfo": {
      "nodes": 1,
      "nodeList": [
        {
          "name": "k3d-containerguard-dev-server-0",
          "status": "True",
          "kubeletVersion": "v1.35.5+k3s1",
          "cpu": "2",
          "memory": "3877852Ki"
        }
      ]
    },
    "pods": [
      {
        "name": "coredns-7c6d4d78db-4j2qn",
        "namespace": "kube-system",
        "status": "Running",
        "containers": 1,
        "restarts": 0,
        "createdAt": "2026-08-10T00:30:00Z",
        "image": "coredns:1.11.1"
      },
      {
        "name": "metrics-server-7b5d4f6d8-x9k2m",
        "namespace": "kube-system",
        "status": "Running",
        "containers": 1,
        "restarts": 0,
        "createdAt": "2026-08-10T00:30:00Z",
        "image": "rancher/metrics-server:v0.6.3"
      }
    ]
  },
  "docker": {
    "info": {
      "version": "29.7.1",
      "containers": 1,
      "containersRunning": 0,
      "containersPaused": 0,
      "containersStopped": 1,
      "images": 4,
      "architecture": "x86_64"
    },
    "containers": [
      {
        "id": "abc123def456...",
        "name": "autonomous-agent",
        "image": "autonomous-agent:latest",
        "status": "Exited",
        "ports": []
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` — Missing or invalid JWT token
- `500 Internal Server Error` — Backend service error

**Special Behavior:**
- If K8s monitoring unavailable: Returns `k8s: { clusterInfo: null, pods: [], error: "K8s monitoring not available" }`
- If Docker monitoring unavailable: Returns `docker: { info: null, containers: [], error: "Docker monitoring not available" }`
- Backend continues running even if services fail (graceful degradation)

**Status:** ✅ Working (tested on Aug 10, 05:38 AM)

---

### GET /api/monitoring/k8s

Get Kubernetes data only.

**Request:**
```bash
curl -X GET https://containerdguard-backend.onrender.com/api/monitoring/k8s \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "clusterInfo": {
    "nodes": 1,
    "nodeList": [...]
  },
  "pods": [...]
}
```

**Error Responses:**
- `401 Unauthorized` — Missing or invalid JWT
- `503 Service Unavailable` — K8s monitoring not available on this deployment

**Status:** ✅ Working

---

### GET /api/monitoring/docker

Get Docker data only.

**Request:**
```bash
curl -X GET https://containerdguard-backend.onrender.com/api/monitoring/docker \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "info": {
    "version": "29.7.1",
    "containers": 1,
    ...
  },
  "containers": [...]
}
```

**Error Responses:**
- `401 Unauthorized` — Missing or invalid JWT
- `503 Service Unavailable` — Docker monitoring not available on this deployment

**Status:** ✅ Working

---

## Health & Status

### GET /health

Health check endpoint (no auth required).

**Request:**
```bash
curl -X GET https://containerdguard-backend.onrender.com/health
```

**Response (200):**
```json
{
  "status": "healthy",
  "service": "containerdguard-backend"
}
```

**Status:** ✅ Working

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Monitoring data retrieved successfully |
| 400 | Bad Request | Missing required fields in request |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Account not verified (future feature) |
| 500 | Server Error | Unexpected backend error |
| 503 | Service Unavailable | K8s or Docker monitoring not available |

### Graceful Degradation

When K8s or Docker services fail:
- **Status Code:** 200 (request still succeeds)
- **Response:** Includes error message in the service object
- **Behavior:** Backend continues running; dashboard shows "unavailable" gracefully

Example:
```json
{
  "k8s": {
    "clusterInfo": null,
    "pods": [],
    "error": "K8s monitoring not available"
  },
  "docker": {
    "info": { "version": "29.7.1", ... },
    "containers": [...]
  }
}
```

---

## Rate Limits

**Current:** No rate limiting (beta)  
**Future:** 100 requests/minute per JWT token

---

## Example Workflows

### 1. Sign Up → Login → Get Monitoring Data

```bash
# Step 1: Sign up
SIGNUP=$(curl -s -X POST https://containerdguard-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "secure-pass",
    "name": "New User"
  }')

TOKEN=$(echo $SIGNUP | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Step 2: Use token to get monitoring data
curl -s -X GET https://containerdguard-backend.onrender.com/api/monitoring/all \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### 2. Check K8s Metrics Only

```bash
curl -X GET https://containerdguard-backend.onrender.com/api/monitoring/k8s \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.pods[] | {name, namespace, status}'
```

Output:
```json
{
  "name": "coredns-7c6d4d78db-4j2qn",
  "namespace": "kube-system",
  "status": "Running"
}
```

### 3. Check Docker Container Status

```bash
curl -X GET https://containerdguard-backend.onrender.com/api/monitoring/docker \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.containers[] | {name, image, status}'
```

Output:
```json
{
  "name": "autonomous-agent",
  "image": "autonomous-agent:latest",
  "status": "Exited"
}
```

### 4. Dashboard Integration (React Fetch Example)

```javascript
// In Dashboard.jsx
const fetchMonitoring = async (token) => {
  const response = await fetch(
    'https://containerdguard-backend.onrender.com/api/monitoring/all',
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

// Usage
const data = await fetchMonitoring(jwtToken);
console.log(`K8s Pods: ${data.k8s.pods.length}`);
console.log(`Docker Containers: ${data.docker.containers.length}`);
```

---

## CORS Configuration

**Allowed Origins:**
- `http://localhost:5173` (local dev)
- `http://localhost:3000` (local dev)
- `https://huggingface.co` (HF Space domain)
- `https://muralipala-containerdguard-dashboard.hf.space` (HF Space Space domain)
- `https://muralipala-containerdguard-dashboard.static.hf.space` (HF Space static assets)

**Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS  
**Allowed Headers:** Content-Type, Authorization

---

## Testing Checklist

- [ ] `/health` returns healthy
- [ ] Sign up with new email works
- [ ] Login with correct credentials works
- [ ] Invalid login returns 401
- [ ] `/api/monitoring/all` with valid token returns data
- [ ] `/api/monitoring/all` without token returns 401
- [ ] K8s data populates correctly
- [ ] Docker data populates correctly
- [ ] Service gracefully handles unavailable K8s/Docker

---

## Support

For API issues or questions:
- **Dashboard:** File feedback via the dashboard form
- **GitHub:** https://github.com/muralipala1504/containerdguard-backend/issues
- **Email:** murali@example.com


