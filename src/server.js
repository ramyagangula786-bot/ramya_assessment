require('dotenv').config();
const express = require('express');
const { extractWithLLM } = require('./extractor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    message: 'Structured Data Extractor API',
    endpoint: 'POST /extract',
    sample_body: { text: 'Paid ₹ 1,250 to AWS India Pvt Ltd on 12 March 2024. Invoice #INV-2024-0312.' }
  });
});

app.post('/extract', async (req, res) => {
  try {
    const { text } = req.body || {};

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Request body must contain a non-empty text string.' });
    }

    const extraction = await extractWithLLM(text);
    return res.json(extraction);
  } catch (error) {
    console.error('Extraction error:', error.message);
    return res.status(500).json({
      error: 'Extraction failed',
      message: error.message
    });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found. Use POST /extract.' });
});

app.listen(PORT, () => {
  console.log(`Structured Data Extractor API running on http://localhost:${PORT}`);
});
