const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated
const genl_routes = require('./router/general.js').general

const app = express()
const PORT = process.env.PORT || 5000

app.use(express.json())

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true,
  })
)

app.use('/customer/auth/*', function auth(req, res, next) {
  if (!req.session.authorization) {
    return res.status(403).json({ message: 'User not logged in' })
  }

  const token = req.session.authorization.accessToken
  jwt.verify(token, 'fingerprint_customer', function (err, user) {
    if (err) {
      return res.status(401).send('Unauthorized: Invalid token')
    }

    req.user = user
    next()
  })
})

app.use('/customer', customer_routes)
app.use('/', genl_routes)

app.listen(PORT, () => console.log('Server is running'))
