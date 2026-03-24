const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'App1 - Psalms Mini App' });
});

app.listen(PORT, () => {
  console.log(`[App1] Server running on port ${PORT}`);
});
