const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()

public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  // Check if users is an array or an object
  if (Array.isArray(users)) {
    const userExists = users.some((user) => user.username === username)

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' })
    }

    users.push({ username, password })
  } else {
    if (username in users) {
      return res.status(400).json({ message: 'User already exists' })
    }

    users[username] = password
  }

  return res.status(201).json({ message: 'User created' })
})

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const books = await getBooks() // Assuming getBooks is a function that returns a promise
    res.status(200).json(books)
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching books', error: error.message })
  }
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params
  const parsedIsbn = parseInt(isbn, 10)

  if (!Number.isInteger(parsedIsbn)) {
    return res
      .status(400)
      .json({ message: 'Invalid ISBN. It should be an integer.' })
  }

  getBookByISBN(parsedIsbn)
    .then((book) => {
      if (book) {
        res.status(200).json(book)
      } else {
        res.status(404).json({ message: 'Book not found' })
      }
    })
    .catch((error) => {
      res
        .status(500)
        .json({ message: 'Error fetching book', error: error.message })
    })
})

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const { author } = req.params

  try {
    const matchingBooks = await getBooksByAuthor(author)

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: 'No books found for this author' })
    }

    return res.status(200).json(matchingBooks)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching books', error: error.message })
  }
})
public_users.get('/title/:title', async function (req, res) {
  const { title } = req.params

  try {
    const matchingBooks = await getBooksByTitle(title)

    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: 'No books found for this title' })
    }

    return res.status(200).json(matchingBooks)
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching books', error: error.message })
  }
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params
  const parsedIsbn = parseInt(isbn, 10)

  if (!Number.isInteger(parsedIsbn)) {
    return res
      .status(400)
      .json({ message: 'Invalid ISBN. It should be an integer.' })
  }

  const book = books[parsedIsbn]
  if (book) {
    return res.status(200).json(book.reviews)
  } else {
    return res.status(404).json({ message: 'Book not found' })
  }
})

module.exports.general = public_users
