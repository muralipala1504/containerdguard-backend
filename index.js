const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { getDB, saveDB } = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'your-secret-key-change-in-production';

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://huggingface.co',
      'https://muralipala-containerdguard-dashboard.hf.space',
      'https://muralipala-containerdguard-dashboard.static.hf.space'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Import monitoring services
const K8sMonitor = require('./k8s-service.js');
const DockerMonitor = require('./docker-service.js');

let k8sMonitor = null;
let dockerMonitor = null;

// Initialize K8s monitoring (optional - fails gracefully if cluster unavailable)
try {
  k8sMonitor = new K8sMonitor();
  console.log('✅ K8s monitoring initialized');
} catch (error) {
  console.warn('⚠️ K8s monitoring unavailable:', error.message);
}

// Initialize Docker monitoring (optional - fails gracefully if daemon unavailable)
try {
  dockerMonitor = new DockerMonitor();
  console.log('✅ Docker monitoring initialized');
} catch (error) {
  console.warn('⚠️ Docker monitoring unavailable:', error.message);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'containerdguard-backend' });
});

// Auth endpoints (existing code)
const { registerUser, loginUser } = require('./auth.js');

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const db = getDB();
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
    saveDB();
    const token = jwt.sign({ email }, SECRET_KEY);
    res.json({ success: true, token, user: { email, name } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const db = getDB();
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    stmt.bind([email]);
    if (stmt.step()) {
      const user = stmt.getAsObject();
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        if (!user.verified) {
          return res.status(403).json({ error: 'Please verify your email first' });
        }
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
        return res.json({ success: true, token, user });
      }
    }
    stmt.free();
    res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unified monitoring endpoint: K8s + Docker
app.get('/api/monitoring/all', async (req, res) => {
  try {
    const k8sData = k8sMonitor ? {
      clusterInfo: await k8sMonitor.getClusterInfo(),
      pods: await k8sMonitor.getAllPods()
    } : { clusterInfo: null, pods: [], error: 'K8s monitoring not available' };

    const dockerData = dockerMonitor ? {
      info: await dockerMonitor.getDockerInfo(),
      containers: await dockerMonitor.getRunningContainers()
    } : { info: null, containers: [], error: 'Docker monitoring not available' };

    res.json({
      k8s: k8sData,
      docker: dockerData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// K8s only endpoint
app.get('/api/monitoring/k8s', async (req, res) => {
  if (!k8sMonitor) {
    return res.status(503).json({ error: 'K8s monitoring not available' });
  }
  try {
    const clusterInfo = await k8sMonitor.getClusterInfo();
    const pods = await k8sMonitor.getAllPods();
    res.json({ clusterInfo, pods });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Docker only endpoint
app.get('/api/monitoring/docker', async (req, res) => {
  if (!dockerMonitor) {
    return res.status(503).json({ error: 'Docker monitoring not available' });
  }
  try {
    const info = await dockerMonitor.getDockerInfo();
    const containers = await dockerMonitor.getRunningContainers();
    res.json({ info, containers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId } = req.body;
    const plans = {
      starter: { priceId: 'price_1U0mUAE5389UQlbCs04zFZyr' },
      pro: { priceId: 'price_1U0mVcE5389UQlbCja9LQPqx' },
      enterprise: { priceId: 'price_1U0mYKE5389UQlbCRHkhO322' }
    };

    if (!plans[planId]) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = {
      sessionId: 'cs_test_' + Math.random().toString(36).substr(2, 9),
      priceId: plans[planId].priceId,
      success_url: 'https://hubspace.aillowpages.com/pricing?success=true',
      cancel_url: 'https://hubspace.aillowpages.com/pricing?canceled=true'
    };

    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
const db = getDB();
app.listen(PORT, () => {
  console.log(`🚀 ContainerGuard Backend running on port ${PORT}`);
  console.log(`✅ Database initialized`);
  console.log(`✅ Database ready`);
});
