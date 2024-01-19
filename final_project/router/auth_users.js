const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

let users = [{ username: 'kane', password: 'password' }]

const isValid = (username) => {
  // Check if username is valid (exists in users array)
  return users.some((user) => user.username === username)
}

const authenticatedUser = (username, password) => {
  //returns boolean
  // Check if username and password are valid
  const user = users.find((user) => user.username === username)
  return user && user.password === password
}

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body
  if (!isValid(username)) {
    return res.status(400).json({ message: 'Invalid username' })
  }
  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: 'Invalid password' })
  }
  const accessToken = jwt.sign({ username: username }, 'fingerprint_customer')
  req.session.authorization = { accessToken: accessToken }
  return res.status(200).json({ message: 'Login successful' })
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params
  const parsedIsbn = parseInt(isbn, 10)

  if (!Number.isInteger(parsedIsbn)) {
    return res
      .status(400)
      .json({ message: 'Invalid ISBN. It should be an integer.' })
  }

  const book = books[parsedIsbn]
  if (book) {
    const { username, review } = req.query

    if (!isValid(username)) {
      return res.status(400).json({ message: 'Invalid username' })
    }

    book.reviews[username] = review

    return res.status(200).json({ message: 'Review added' })
  } else {
    return res.status(404).json({ message: 'Book not found' })
  }
})

regd_users.delete('/auth/review/:isbn', function (req, res) {
  const { isbn } = req.params
  const parsedIsbn = parseInt(isbn, 10)

  if (!Number.isInteger(parsedIsbn)) {
    return res
      .status(400)
      .json({ message: 'Invalid ISBN. It should be an integer.' })
  }

  const book = books[parsedIsbn]
  if (book) {
    const { username } = req.query

    if (!isValid(username)) {
      return res.status(400).json({ message: 'Invalid username' })
    }

    delete book.reviews[username]

    return res.status(200).json({ message: 'Review deleted' })
  } else {
    return res.status(404).json({ message: 'Book not found' })
  }
})

module.exports.authenticated = regd_users
module.exports.isValid = isValid
module.exports.users = users
