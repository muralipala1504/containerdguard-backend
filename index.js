const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { initDB, getDB, saveDB, closeDB } = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = 'your-secret-key-change-in-production';

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://huggingface.co',
      'https://muralipala-containerdguard-dashboard.hf.space',
      'https://muralipala-containerdguard-dashboard.static.hf.space',
      'http://192.168.217.163:5173'
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

const K8sMonitor = require('./k8s-service.js');
const DockerMonitor = require('./docker-service.js');

let k8sMonitor = null;
let dockerMonitor = null;

try {
  k8sMonitor = new K8sMonitor();
  console.log('✅ K8s monitoring initialized');
} catch (error) {
  console.warn('⚠️ K8s monitoring unavailable:', error.message);
}

try {
  dockerMonitor = new DockerMonitor();
  console.log('✅ Docker monitoring initialized');
} catch (error) {
  console.warn('⚠️ Docker monitoring unavailable:', error.message);
}

app.get('/', (req, res) => {
  res.json({ service: 'ContainerGuard Backend', version: '1.0', status: 'running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'containerdguard-backend' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const db = getDB();

    try {
      db.run(`INSERT INTO users (email, password, name) VALUES (?, ?, ?)`, [email, hashedPassword, name]);
      saveDB();
      
      const token = jwt.sign({ email }, SECRET_KEY);
      res.json({ success: true, token, user: { email, name } });
      console.log(`✅ User registered: ${email}`);
    } catch (err) {
      return res.status(400).json({ error: 'Email already exists' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = getDB();
    
    try {
      const result = db.exec(`SELECT * FROM users WHERE email = ?`, [email]);
      
      if (result.length === 0 || result[0].values.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const row = result[0].values[0];
      const user = {
        id: row[0],
        email: row[1],
        password: row[2],
        name: row[3]
      };

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
      res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
      console.log(`✅ User logged in: ${email}`);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/monitoring/all', async (req, res) => {
  try {
    const k8sData = k8sMonitor ? {
      clusterInfo: await k8sMonitor.getClusterInfo(),
      pods: await k8sMonitor.getAllPods()
    } : { clusterInfo: null, pods: [], error: 'K8s unavailable' };

    const dockerData = dockerMonitor ? {
      info: await dockerMonitor.getDockerInfo(),
      containers: await dockerMonitor.getRunningContainers()
    } : { info: null, containers: [], error: 'Docker unavailable' };

    res.json({ k8s: k8sData, docker: dockerData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/monitoring/k8s', async (req, res) => {
  if (!k8sMonitor) return res.status(503).json({ error: 'K8s unavailable' });
  try {
    res.json({
      clusterInfo: await k8sMonitor.getClusterInfo(),
      pods: await k8sMonitor.getAllPods()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/monitoring/docker', async (req, res) => {
  if (!dockerMonitor) return res.status(503).json({ error: 'Docker unavailable' });
  try {
    res.json({
      info: await dockerMonitor.getDockerInfo(),
      containers: await dockerMonitor.getRunningContainers()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

(async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 ContainerGuard Backend running on port ${PORT}`);
      console.log(`✅ Database ready`);
    });
  } catch (error) {
    console.error('Failed to start:', error);
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  closeDB();
  process.exit(0);
});
