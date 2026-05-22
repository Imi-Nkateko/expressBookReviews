const express = require("express");
const axios = require("axios"); 
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper: Base URL for internal API calls (assuming server runs on same port)
const API_BASE = "http://localhost:8800";

// User registration (remains synchronous as it doesn't fetch book data)
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

// Get the book list available in the shop (using Axios)
public_users.get("/", async function (req, res) {
  try {
    const response = await axios.get(`${API_BASE}/books`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book list", error: error.message });
  }
});

// Get book details based on ISBN (using Axios)
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${API_BASE}/books/${isbn}`);
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error fetching book", error: error.message });
  }
});

// Get book details based on author (using Axios)
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author;
  try {
    const response = await axios.get(`${API_BASE}/books?author=${encodeURIComponent(author)}`);
    if (response.data.length === 0) {
      return res.status(404).json({ message: "No books found by this author" });
    }
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

// Get all books based on title (using Axios)
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title;
  try {
    const response = await axios.get(`${API_BASE}/books?title=${encodeURIComponent(title)}`);
    if (response.data.length === 0) {
      return res.status(404).json({ message: "No books found with this title" });
    }
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

// Get book review (using Axios)
public_users.get("/review/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const response = await axios.get(`${API_BASE}/books/${isbn}/reviews`);
    if (!response.data || Object.keys(response.data).length === 0) {
      return res.status(200).json({ message: "No reviews for this book yet" });
    }
    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
});

module.exports.general = public_users;
