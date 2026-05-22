const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (i.e., exists in users array)
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if username and password match an existing user
const authenticatedUser = (username, password) => {
  const user = users.find(
    (user) => user.username === username && user.password === password,
  );
  return !!user;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate JWT token (secret must match the one used in session middleware)
  const accessToken = jwt.sign({ username }, "fingerprint_customer", {
    expiresIn: "1h",
  });

  // Store token and user info in session
  req.session.authorization = {
    accessToken,
    user: { username },
  };

  return res.status(200).json({ message: "Login successful", accessToken });
});

// Add or modify a book review (authenticated route)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.body.review;
  const username = req.session.authorization?.user?.username;

  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if not present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add or update the review (using username as key)
  books[isbn].reviews[username] = reviewText;

  return res
    .status(200)
    .json({
      message: "Review added/modified successfully",
      reviews: books[isbn].reviews,
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
