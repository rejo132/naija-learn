const fs = require('fs');

const inputFile = process.argv[2] || 'static-lessons.json';
let text = fs.readFileSync(inputFile, 'utf8');

let result = '';
let inString = false;
let escaped = false;

for (let i = 0; i < text.length; i++) {
  const ch = text[i];

  if (inString) {
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      result += ch;
      inString = false;
      continue;
    }
    // Inside a string - escape raw control chars
    if (ch === '\n') { result += '\\n'; continue; }
    if (ch === '\r') { continue; } // drop carriage returns
    if (ch === '\t') { result += '\\t'; continue; }
    if (ch.charCodeAt(0) < 0x20) { continue; } // drop other control chars
    result += ch;
  } else {
    if (ch === '"') {
      inString = true;
    }
    result += ch;
  }
}

const parsed = JSON.parse(result);
fs.writeFileSync(inputFile, JSON.stringify(parsed, null, 2));
console.log('Fixed and saved. Lessons:', parsed.length);
