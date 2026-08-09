const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_51U0Q2AE5389UQlbCyBj2b2ikN63RJ4S0bynTnbMUgvnJToWJ0MgxBMmBIaphtOOD4d1yYE4rU8mnPDtsROZXzVFC00bxFo7TxL')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3001
const SECRET_KEY = 'your-secret-key-change-this'

let db = null

// Initialize database on startup
const { initDB, saveDB } = require('./db')
initDB().then(() => {
  console.log('✅ Database ready')
})

app.use(cors())
app.use(bodyParser.json())

// Helper to get DB
function getDB() {
  const { db: dbGetter } = require('./db')
  return dbGetter()
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'containerdguard-backend' })
})

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing fields' })
    }

    const db = getDB()
    const hashedPassword = await bcrypt.hash(password, 10)
    
    db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name])
    saveDB()

    const token = jwt.sign({ email }, SECRET_KEY)
    res.json({ success: true, token, user: { email, name } })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const db = getDB()
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?')
    stmt.bind([email])
    
    if (stmt.step()) {
      const user = stmt.getAsObject()
      const validPassword = await bcrypt.compare(password, user.password)
      
      if (validPassword) {
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY)
        return res.json({ success: true, token, user })
      }
    }
    stmt.free()
    
    res.status(401).json({ error: 'Invalid credentials' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Stripe checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId } = req.body

    const plans = {
      starter: { priceId: 'price_1U0mUAE5389UQlbCs04zFZyr' },
      pro: { priceId: 'price_1U0mVcE5389UQlbCja9LQPqx' },
      enterprise: { priceId: 'price_1U0mYKE5389UQlbCRHkhO322' }
    }

    const plan = plans[planId]
    if (!plan) return res.status(400).json({ error: 'Invalid plan' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      mode: 'subscription',
success_url: 'https://hubspace.aillowpages.com/pricing?success=true',
cancel_url: 'https://hubspace.aillowpages.com/pricing?canceled=true'})

    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 ContainerGuard Backend running on port ${PORT}`)
})

// Import monitoring services
const K8sMonitor = require('./k8s-service.js');
const DockerMonitor = require('./docker-service.js');

const k8sMonitor = new K8sMonitor();
const dockerMonitor = new DockerMonitor();

// Unified monitoring endpoint: K8s + Docker
app.get('/api/monitoring/all', async (req, res) => {
  try {
    const k8sClusters = await k8sMonitor.getClusterInfo();
    const k8sPods = await k8sMonitor.getAllPods();
    const dockerContainers = await dockerMonitor.getRunningContainers();
    const dockerInfo = await dockerMonitor.getDockerInfo();

    res.json({
      k8s: {
        clusterInfo: k8sClusters,
        pods: k8sPods
      },
      docker: {
        info: dockerInfo,
        containers: dockerContainers
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// K8s only endpoint
app.get('/api/monitoring/k8s', async (req, res) => {
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
  try {
    const info = await dockerMonitor.getDockerInfo();
    const containers = await dockerMonitor.getRunningContainers();
    res.json({ info, containers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
