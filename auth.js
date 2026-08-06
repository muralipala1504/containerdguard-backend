const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('./db')

const SECRET_KEY = 'your-secret-key-change-this-in-production'

// Register user
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    db.run(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' })
        }
        
        const token = jwt.sign({ id: this.lastID, email }, SECRET_KEY)
        res.json({ 
          success: true, 
          token, 
          user: { id: this.lastID, email, name } 
        })
      }
    )
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' })
      }

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY)
      res.json({ 
        success: true, 
        token, 
        user: { id: user.id, email: user.email, name: user.name } 
      })
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
