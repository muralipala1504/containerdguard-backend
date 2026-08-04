const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const stripe = require('stripe')('sk_test_51U0Q2AE5389UQlbCyBj2b2ikN63RJ4S0bynTnbMUgvnJToWJ0MgxBMmBIaphtOOD4d1yYE4rU8mnPDtsROZXzVFC00bxFo7TxL')

const app = express()
const PORT = 3001

app.use(cors())
app.use(bodyParser.json())

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'containerdguard-backend' })
})

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { planId } = req.body

    const plans = {
      starter: { priceId: 'price_1U0mUAE5389UQlbCs04zFZyr', name: 'Starter' },
      pro: { priceId: 'price_1U0mVcE5389UQlbCja9LQPqx', name: 'Pro' },
      enterprise: { priceId: 'price_1U0mYKE5389UQlbCRHkhO322', name: 'Enterprise' }
    }

    const plan = plans[planId]
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: 'http://192.168.217.163:5173/dashboard?success=true',
      cancel_url: 'http://192.168.217.163:5173/pricing?canceled=true'
    })

    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 ContainerGuard Backend running on port ${PORT}`)
})
