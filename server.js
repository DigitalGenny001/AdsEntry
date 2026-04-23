const path = require("path");
const express = require('express');
const app = express();
const cors = require("cors");
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Enable CORS to avoid Network errors from frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Basic route requirement
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// In-memory user store
const users = [];

// API Routes to support the frontend
app.post('/login', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ success: true, username });
});

app.post('/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  users.push({ username, password });
  res.json({ success: true, username });
});

app.get('/api/me', (req, res) => {
  // Simulate logged out by default
  res.status(401).json({ error: 'Not authenticated' });
});

app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

app.get('/api/links', (req, res) => {
  res.json([]);
});

app.post('/api/shorten', (req, res) => {
  const { originalUrl, platform } = req.body;
  const shortId = Math.random().toString(36).substring(2, 8);
  res.json({ originalUrl, platform, shortUrl: `http://localhost:3000/${shortId}` });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
