# ContainerGuard Beta Test Plan

**Test Date:** August 10, 2026  
**Tester:** Murali  
**Status:** Ready for Testing

---

## Overview

This document outlines all test cases to verify ContainerGuard functionality before beta launch. Tests should be executed in order and results logged below.

---

## Pre-Test Checklist

- [ ] Backend is deployed on Render (check https://containerdguard-backend.onrender.com/health)
- [ ] Dashboard is live on HF Space (check https://huggingface.co/spaces/muralipala/containerdguard-dashboard)
- [ ] K8s cluster is running (k3dserver accessible)
- [ ] Docker daemon is running (local machine)
- [ ] Browser developer console is open (F12) for error monitoring
- [ ] Test user credentials ready (or create new ones during testing)

---

## Test Suite 1: Authentication

### T1.1 — User Signup

**Objective:** Verify new users can create accounts

**Steps:**
1. Open https://huggingface.co/spaces/muralipala/containerdguard-dashboard
2. Should see login page with "Sign up" option
3. Click "Sign up"
4. Fill in:
   - Email: `testuser_${RANDOM}@example.com` (unique)
   - Name: "Test User"
   - Password: "TestPassword123!"
5. Click "Create Account"

**Expected Result:** 
- ✅ Account created successfully
- ✅ Redirected to dashboard
- ✅ "Welcome, Test User!" displayed
- ✅ No errors in console (F12)

**Actual Result:** _______________

**Notes:** _______________

---

### T1.2 — User Login

**Objective:** Verify existing users can log in

**Steps:**
1. Open dashboard (should auto-logout after refresh)
2. On login page, enter:
   - Email: `test5@example.com`
   - Password: (enter actual password)
3. Click "Login"

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ "Welcome, test5!" displayed
- ✅ No errors in console

**Actual Result:** _______________

**Notes:** _______________

---

### T1.3 — Invalid Login

**Objective:** Verify invalid credentials are rejected

**Steps:**
1. On login page, enter:
   - Email: `test5@example.com`
   - Password: `wrongpassword`
2. Click "Login"

**Expected Result:**
- ✅ Login fails with error message
- ✅ Error displayed: "Invalid credentials" or similar
- ✅ User stays on login page

**Actual Result:** _______________

**Notes:** _______________

---

### T1.4 — Missing Fields

**Objective:** Verify form validation on signup

**Steps:**
1. Click "Sign up"
2. Leave all fields empty
3. Click "Create Account"

**Expected Result:**
- ✅ Form prevents submission
- ✅ Error message appears: "Missing fields" or similar
- ✅ Page doesn't reload

**Actual Result:** _______________

**Notes:** _______________

---

## Test Suite 2: Dashboard Loading & UI

### T2.1 — Dashboard Loads Without Errors

**Objective:** Verify dashboard renders properly after login

**Prerequisites:** Must be logged in (T1.2 passed)

**Steps:**
1. On dashboard, observe the page layout
2. Open F12 → Console tab
3. Look for any red error messages

**Expected Result:**
- ✅ Dashboard fully renders
- ✅ No red errors in console
- ✅ "Welcome, [username]!" visible
- ✅ View toggle buttons visible (All/K8s/Docker)
- ✅ Metrics cards visible (Running Containers, CPU, Memory, Health)

**Actual Result:** _______________

**Notes:** _______________

---

### T2.2 — View Toggle: All

**Objective:** Verify "All" view displays K8s + Docker data

**Steps:**
1. Click the "All (0)" button at top
2. Wait 5 seconds for data to load
3. Observe displayed data

**Expected Result:**
- ✅ View shows both K8s and Docker metrics
- ✅ "Running Containers" card visible
- ✅ CPU and Memory cards show values
- ✅ Health Status card shows state

**Actual Result:** _______________

**Notes:** _______________

---

### T2.3 — View Toggle: Kubernetes Only

**Objective:** Verify K8s-only view works

**Steps:**
1. Click the "Kubernetes (0)" button
2. Wait 5 seconds
3. Observe displayed data

**Expected Result:**
- ✅ View switches to K8s only
- ✅ Displays K8s-specific metrics
- ✅ Pod list visible (if any pods running)
- ✅ Namespace information shown

**Actual Result:** _______________

**Notes:** _______________

---

### T2.4 — View Toggle: Docker Only

**Objective:** Verify Docker-only view works

**Steps:**
1. Click the "Docker (0)" button
2. Wait 5 seconds
3. Observe displayed data

**Expected Result:**
- ✅ View switches to Docker only
- ✅ Shows Docker-specific metrics
- ✅ Container list visible (if any running)
- ✅ Image and port info shown

**Actual Result:** _______________

**Notes:** _______________

---

## Test Suite 3: Monitoring Data

### T3.1 — K8s Cluster Info

**Objective:** Verify K8s cluster data is accessible

**Steps:**
1. Switch to "Kubernetes" view
2. Look for cluster information section
3. Verify node count, CPU, memory displayed

**Expected Result:**
- ✅ Cluster info shows node count (should be 1)
- ✅ CPU allocation visible (2 cores)
- ✅ Memory allocation visible (~3.8GB)
- ✅ Kubelet version shown (v1.35.5+k3s1)

**Actual Result:** _______________

**Notes:** _______________

---

### T3.2 — K8s Pods List

**Objective:** Verify K8s pods are listed correctly

**Steps:**
1. In "Kubernetes" view, scroll to pods section
2. Verify pod names, namespaces, status visible

**Expected Result:**
- ✅ Pod list displayed (should see coredns, metrics-server, traefik, etc.)
- ✅ Each pod shows:
   - Name
   - Namespace (kube-system, default, etc.)
   - Status (Running, Pending, etc.)
   - Container count
   - Image name
- ✅ At least 5 pods visible

**Actual Result:** _______________

**Notes:** _______________

---

### T3.3 — Docker Container Info

**Objective:** Verify Docker container data is accessible

**Steps:**
1. Switch to "Docker" view
2. Look for Docker version info
3. Observe container inventory

**Expected Result:**
- ✅ Docker version displayed (should be 29.7.1)
- ✅ Container count shown
- ✅ Image count shown
- ✅ Architecture shown (x86_64)

**Actual Result:** _______________

**Notes:** _______________

---

### T3.4 — Docker Container List

**Objective:** Verify Docker containers listed correctly

**Steps:**
1. In "Docker" view, scroll to containers section
2. Verify container names, images, status visible

**Expected Result:**
- ✅ Container list displayed
- ✅ Each container shows:
   - Container name
   - Image name
   - Status (Running, Exited, etc.)
   - Ports (if any)
- ✅ "autonomous-agent" container visible (status: Exited)

**Actual Result:** _______________

**Notes:** _______________

---

## Test Suite 4: Real-Time Updates

### T4.1 — Auto-Refresh Every 5 Seconds

**Objective:** Verify dashboard refreshes data periodically

**Steps:**
1. Open "All" view
2. Observe metrics (CPU, Memory)
3. Wait 5 seconds
4. Check if values updated

**Expected Result:**
- ✅ Metrics refresh every ~5 seconds
- ✅ Timestamp or visual indicator of refresh (loading spinner)
- ✅ No page reload (smooth updates)

**Actual Result:** _______________

**Notes:** _______________

---

### T4.2 — Network Tab: Verify API Calls

**Objective:** Verify dashboard is calling backend correctly

**Steps:**
1. Open F12 → Network tab
2. Switch to "All" view
3. Watch for API calls
4. Look for request to `https://containerdguard-backend.onrender.com/api/monitoring/all`

**Expected Result:**
- ✅ API request to backend visible
- ✅ Status code: 200 (success)
- ✅ Response contains k8s and docker data
- ✅ Request headers include Authorization token

**Actual Result:** _______________

**Notes:** _______________

---

## Test Suite 5: Error Handling

### T5.1 — Simulate Network Error

**Objective:** Verify dashboard handles backend unavailability gracefully

**Steps:**
1. Open F12 → Network tab
2. Switch to "Offline" mode (disable network)
3. Try to refresh dashboard or wait for next auto-refresh
4. Observe error handling

**Expected Result:**
- ✅ Dashboard shows error message (not "Failed to connect")
- ✅ Page doesn't crash
- ✅ UI remains usable
- ✅ Suggests retrying

**Actual Result:** _______________

**Notes:** _______________

### T5.2 — Re-enable Network

**Steps:**
1. Re-enable network in F12
2. Manually refresh dashboard
3. Verify data loads again

**Expected Result:**
- ✅ Dashboard recovers
- ✅ Data loads successfully
- ✅ No stale data shown

**Actual Result:** _______________

**Notes:** _______________

---

## Test Suite 6: API Testing (cURL)

### T6.1 — Health Check Endpoint

**Objective:** Verify health endpoint works

**Command:**
```bash
curl -s https://containerdguard-backend.onrender.com/health | jq .
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "containerdguard-backend"
}
```

**Actual Response:** _______________

**Status:** ✅ / ❌

---

### T6.2 — Monitor All Endpoint

**Objective:** Verify API returns complete data

**Command:**
```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  https://containerdguard-backend.onrender.com/api/monitoring/all | jq '.k8s.pods | length'
```

**Expected Response:** Number > 0 (pod count)

**Actual Response:** _______________

**Status:** ✅ / ❌

---

### T6.3 — K8s Only Endpoint

**Command:**
```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  https://containerdguard-backend.onrender.com/api/monitoring/k8s | jq '.clusterInfo.nodes'
```

**Expected Response:** 1 (one node)

**Actual Response:** _______________

**Status:** ✅ / ❌

---

### T6.4 — Docker Only Endpoint

**Command:**
```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  https://containerdguard-backend.onrender.com/api/monitoring/docker | jq '.info.version'
```

**Expected Response:** "29.7.1"

**Actual Response:** _______________

**Status:** ✅ / ❌

---

## Test Suite 7: Security

### T7.1 — JWT Token Required

**Objective:** Verify monitoring endpoints require authentication

**Steps:**
1. Try calling API without Authorization header:
```bash
curl -s https://containerdguard-backend.onrender.com/api/monitoring/all | jq .
```

**Expected Result:**
- ✅ Request fails with 401 Unauthorized
- ✅ Error message returned (not full data)

**Actual Result:** _______________

**Notes:** _______________

---

### T7.2 — Invalid Token Rejected

**Steps:**
1. Call API with invalid token:
```bash
curl -s -H "Authorization: Bearer invalid-token-123" \
  https://containerdguard-backend.onrender.com/api/monitoring/all | jq .
```

**Expected Result:**
- ✅ Request fails with 401 Unauthorized
- ✅ Endpoint protected

**Actual Result:** _______________

**Notes:** _______________

---

### T7.3 — Password Hashing Verified

**Objective:** Verify passwords are hashed (not stored plaintext)

**Check:**
1. Attempt login with correct password → Should succeed
2. Check browser storage (F12 → Storage) → Should NOT show plaintext password
3. Only JWT token should be stored

**Expected Result:**
- ✅ Login with correct password works
- ✅ Plaintext password NOT in localStorage
- ✅ Only JWT token visible

**Actual Result:** _______________

**Notes:** _______________

---

## Test Suite 8: Browser Compatibility

### T8.1 — Chrome/Chromium

**Steps:**
1. Open dashboard in Chrome/Chromium
2. Complete T2.1 through T4.2 tests

**Status:** ✅ / ❌  
**Notes:** _______________

---

### T8.2 — Firefox

**Steps:**
1. Open dashboard in Firefox
2. Complete T2.1 through T4.2 tests

**Status:** ✅ / ❌  
**Notes:** _______________

---

### T8.3 — Safari (if available)

**Steps:**
1. Open dashboard in Safari
2. Complete T2.1 through T4.2 tests

**Status:** ✅ / ❌  
**Notes:** _______________

---

## Test Suite 9: Performance

### T9.1 — Dashboard Load Time

**Steps:**
1. Open DevTools → Performance tab
2. Reload dashboard
3. Measure Time to Interactive (TTI)

**Expected Result:**
- ✅ TTI < 3 seconds
- ✅ No performance warnings

**Actual Result:** _______________

**Notes:** _______________

---

### T9.2 — API Response Time

**Steps:**
1. Call monitoring endpoint 5 times
2. Average response time

**Command:**
```bash
for i in {1..5}; do
  time curl -s -H "Authorization: Bearer YOUR_TOKEN" \
    https://containerdguard-backend.onrender.com/api/monitoring/all > /dev/null
done
```

**Expected Result:**
- ✅ Average response < 1 second
- ✅ No timeouts

**Actual Response Times:** _______________

**Notes:** _______________

---

## Test Suite 10: Data Accuracy

### T10.1 — K8s Pod Count Matches

**Steps:**
1. Get pod count from dashboard (K8s view)
2. Verify with kubectl:
```bash
kubectl get pods --all-namespaces | wc -l
```

**Expected Result:**
- ✅ Dashboard count matches kubectl
- ✅ Within 1-2 second of query time

**Dashboard Count:** _______________  
**kubectl Count:** _______________  
**Match:** ✅ / ❌

---

### T10.2 — Docker Container Count Matches

**Steps:**
1. Get container count from dashboard (Docker view)
2. Verify with docker:
```bash
docker ps -a | wc -l
```

**Expected Result:**
- ✅ Dashboard count matches docker
- ✅ Within 1-2 second of query time

**Dashboard Count:** _______________  
**docker Count:** _______________  
**Match:** ✅ / ❌

---

## Test Summary

### Overall Status

- **Total Tests:** 38+
- **Passed:** _____ / _____
- **Failed:** _____ / _____
- **Skipped:** _____ / _____

### Blockers (If Any)

List any critical issues that prevent launch:
1. _______________
2. _______________
3. _______________

### Known Issues (Non-Blocking)

List minor issues to address in Phase 2:
1. _______________
2. _______________
3. _______________

### Test Completion Date

**Tested By:** _______________  
**Date:** _______________  
**Signature:** _______________

---

## Post-Test Actions

- [ ] Review all test results
- [ ] Verify all critical tests passed (Suite 1-4)
- [ ] Document any blockers
- [ ] If all pass: Approve for beta launch
- [ ] Notify beta users (send Typeform link)
- [ ] Monitor first users for issues
- [ ] Collect feedback for Phase 2

---

## Notes

Use this space for any observations during testing:

_______________________________________________

_______________________________________________

_______________________________________________


