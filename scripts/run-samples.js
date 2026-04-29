require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { extractWithLLM } = require('../src/extractor');

const samples = [
  {
    label: 'Clean receipt',
    text: 'Paid ₹ 1,250 to AWS India Pvt Ltd on 12 March 2024. Invoice #INV-2024-0312. Services: cloud compute.'
  },
  {
    label: 'Vendor email',
    text: 'Hi team, please find attached the invoice from Zoho Corp for ₹ 4,800 (software subscription, April 2024). Reference: ZHO-88821.'
  },
  {
    label: 'Slack message',
    text: 'hey can someone reimburse me for the uber last tuesday? it was like 340 rupees, went to the airport for the client meeting'
  },
  {
    label: 'Scanned receipt',
    text: 'DELHI METRO RAIL CORP Token: 0042 Fare: INR 30 Date: 29-04-2024 From: Rajiv Chowk To: Hauz Khas'
  },
  {
    label: 'Ambiguous/garbage',
    text: 'meeting notes: discussed q2 targets, revenue up 12%, john to follow up with vendors next week'
  }
];

async function main() {
  const outputs = [];
  for (const sample of samples) {
    const extraction = await extractWithLLM(sample.text);
    outputs.push({ label: sample.label, input: sample.text, output: extraction });
    console.log(`Completed: ${sample.label}`);
  }

  const outPath = path.join(__dirname, '..', 'results.json');
  fs.writeFileSync(outPath, JSON.stringify(outputs, null, 2));
  console.log(`Saved results to ${outPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
