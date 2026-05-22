const express = require("express");
const axios = require("axios");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const API_BASE = "http://localhost:8800/api"; // base for internal API

// Register (unchanged, no Axios needed)
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get all books (using Axios)
public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/books`);
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

// Get book by ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${API_BASE}/books/${isbn}`);
    res.status(200).json(response.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(500).json({ message: "Error fetching book" });
  }
});

// Get books by author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`${API_BASE}/books?author=${encodeURIComponent(author)}`);
    if (response.data.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books by author" });
  }
});

// Get books by title
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;
  try {
    const response = await axios.get(`${API_BASE}/books?title=${encodeURIComponent(title)}`);
    if (response.data.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching books by title" });
  }
});

// Get reviews by ISBN
public_users.get("/review/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${API_BASE}/books/${isbn}/reviews`);
    const reviews = response.data;
    if (Object.keys(reviews).length === 0) {
      return res.status(200).json({ message: "No reviews for this book yet" });
    }
    res.status(200).json(reviews);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

module.exports.general = public_users;
