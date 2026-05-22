const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User registration
public_users.post("/register", (req, res) => {
  // Extract username and password from the request body
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists (using the imported isValid function)
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register the new user by pushing to the users array
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  const bookList = JSON.stringify(books, null, 2);
  return res.status(200).send(bookList);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    const bookDetails = JSON.stringify(book, null, 2);
    return res.status(200).send(bookDetails);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Get book details based on author
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].title === title) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    const result = JSON.stringify(matchingBooks, null, 2);
    return res.status(200).send(result);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].title === title) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    const result = JSON.stringify(matchingBooks, null, 2);
    return res.status(200).send(result);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews;
    if (reviews && Object.keys(reviews).length > 0) {
      return res.status(200).send(JSON.stringify(reviews, null, 2));
    } else {
      return res.status(200).json({ message: "No reviews for this book yet" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
module.exports.general = public_users;
