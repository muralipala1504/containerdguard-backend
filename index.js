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
      success_url: 'https://containerguard-dashboard.vercel.app/dashboard?success=true',
      cancel_url: 'https://containerguard-dashboard.vercel.app/pricing?canceled=true'

})

    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 ContainerGuard Backend running on port ${PORT}`)
})
