const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildPrompt } = require('./prompt');

const FIELD_NAMES = [
  'vendor_name',
  'amount',
  'currency',
  'date',
  'category',
  'description',
  'invoice_id'
];

const VALID_CATEGORIES = new Set(['food', 'travel', 'utilities', 'software', 'other']);
const REVIEW_THRESHOLD = 0.75;

function cleanJsonText(text) {
  return String(text || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
}

function clampConfidence(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0.1;
  return Math.max(0, Math.min(1, Number(n.toFixed(2))));
}

function normalizeValue(field, value) {
  if (value === undefined || value === '') return null;
  if (value === null) return null;

  if (field === 'amount') {
    const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''));
    return Number.isFinite(numeric) ? numeric : null;
  }

  if (field === 'currency') {
    return String(value).trim().toUpperCase() || null;
  }

  if (field === 'category') {
    const category = String(value).trim().toLowerCase();
    return VALID_CATEGORIES.has(category) ? category : 'other';
  }

  return String(value).trim() || null;
}

function ensureShape(raw) {
  const sourceFields = raw && raw.fields && typeof raw.fields === 'object' ? raw.fields : {};
  const fields = {};

  for (const field of FIELD_NAMES) {
    const item = sourceFields[field] || {};
    const value = normalizeValue(field, item.value);
    let confidence = clampConfidence(item.confidence);

    if (value === null && confidence > 0.35) confidence = 0.35;

    fields[field] = {
      value,
      confidence,
      needs_review: confidence < REVIEW_THRESHOLD
    };
  }

  return {
    review_required: Object.values(fields).some(field => field.needs_review),
    fields
  };
}

async function extractWithLLM(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing. Add it to .env before running extraction.');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: buildPrompt(text) }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  });

  const responseText = result.response.text();
  const parsed = JSON.parse(cleanJsonText(responseText));
  return ensureShape(parsed);
}

module.exports = { extractWithLLM, ensureShape, REVIEW_THRESHOLD };
