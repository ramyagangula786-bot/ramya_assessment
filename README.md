# Ramya_Nestack_Submission

## Structured Data Extractor API

This is a Node.js backend API for extracting database-ready fields from unstructured transaction text using an LLM.

## Tech Stack

- Node.js
- Express.js
- Google Gemini API
- Model: `gemini-2.5-flash-lite`

## Why Gemini 2.5 Flash Lite?

Gemini 2.5 Flash Lite is suitable for this task because the API needs fast, low-latency extraction from short text inputs such as receipts, vendor emails, and Slack messages. It is also cost-effective for repeated extraction calls.

## Features

- `POST /extract` endpoint
- Extracts the required target fields:
  - vendor_name
  - amount
  - currency
  - date
  - category
  - description
  - invoice_id
- Returns each field with:
  - value
  - confidence
  - needs_review
- Applies review threshold consistently:
  - confidence `< 0.75` means `needs_review: true`
- Returns top-level `review_required: true` when any field needs review
- Handles ambiguous or missing transaction data safely

## Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
copy .env.example .env
```

### 3. Add Gemini API key

Open `.env` and add your API key:

```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

### 4. Run the server

```bash
npm start
```

Server runs at:

```text
http://localhost:3000
```

## API Endpoint

### POST `/extract`

Request body:

```json
{
  "text": "Paid ₹ 1,250 to AWS India Pvt Ltd on 12 March 2024. Invoice #INV-2024-0312. Services: cloud compute."
}
```

Example curl:

```bash
curl -X POST http://localhost:3000/extract \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Paid ₹ 1,250 to AWS India Pvt Ltd on 12 March 2024. Invoice #INV-2024-0312. Services: cloud compute.\"}"
```

Response shape:

```json
{
  "review_required": false,
  "fields": {
    "vendor_name": { "value": "AWS India Pvt Ltd", "confidence": 0.96, "needs_review": false },
    "amount": { "value": 1250, "confidence": 0.98, "needs_review": false },
    "currency": { "value": "INR", "confidence": 0.98, "needs_review": false },
    "date": { "value": "2024-03-12", "confidence": 0.97, "needs_review": false },
    "category": { "value": "software", "confidence": 0.9, "needs_review": false },
    "description": { "value": "Cloud compute services", "confidence": 0.88, "needs_review": false },
    "invoice_id": { "value": "INV-2024-0312", "confidence": 0.97, "needs_review": false }
  }
}
```

## Run Sample Inputs

After adding the Gemini API key, run:

```bash
npm run samples
```

This runs all five assessment sample inputs and writes the outputs to:

```text
results.json
```

## Prompt Strategy

The prompt asks the LLM to return only JSON and to provide a separate confidence score for every target field. It explicitly tells the model not to provide one overall confidence score.

The prompt also gives scoring rules:

- High confidence when a field is directly stated
- Lower confidence when a field is inferred, ambiguous, relative, or missing
- Missing fields must return `null` with low confidence
- Relative dates like `last Tuesday` must not be converted unless a reference date is available
- Currency symbols such as `₹`, `rupees`, and `INR` should normalize to `INR`

After the LLM response, the backend validates and normalizes the output shape. It then applies the fixed threshold of `0.75` to every field. This ensures the review flag logic is deterministic and consistent across all inputs.

## Project Structure

```text
Ramya_Nestack_Submission/
├── src/
│   ├── extractor.js
│   ├── prompt.js
│   └── server.js
├── scripts/
│   └── run-samples.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── results.json
```

## Deployment Link

Add your live deployment link here after deploying:

```text
Deployment Link: <paste-live-link-here>
```
