const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const STATIC_DIR = path.join(__dirname);

// Serve static files from the project root (index.html, styles.css, etc.)
app.use(express.static(STATIC_DIR));

// Simple API endpoint for health checks or future APIs
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'project_sample' });
});

// Fallback to index.html for SPA-style routing (keeps static files served normally)
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
