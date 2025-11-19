const fs = require('fs');
const path = require('path');

const inputFile = path.join('..', 'backend', 'controllers', 'umkmController.js');
const outputFile = path.join('..', 'backend', 'controllers', 'umkmController_utf8.js');

console.log('🔧 Converting file encoding to UTF-8...\n');

// Baca sebagai buffer
const buffer = fs.readFileSync(inputFile);

console.log('Input file size:', buffer.length, 'bytes');
console.log('First bytes (hex):', buffer.slice(0, 10).toString('hex'));

// Detect dan convert dari UTF-16 LE
let content;
if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
  console.log('Detected: UTF-16 LE with BOM');
  // Skip BOM (2 bytes) dan decode UTF-16 LE
  content = buffer.slice(2).toString('utf16le');
} else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  console.log('Detected: UTF-8 with BOM');
  // Skip BOM dan decode UTF-8
  content = buffer.slice(3).toString('utf8');
} else {
  console.log('Detected: UTF-8 without BOM');
  content = buffer.toString('utf8');
}

console.log('Content length:', content.length, 'characters');
console.log('First line:', content.split('\n')[0]);

// Tulis sebagai UTF-8 tanpa BOM
fs.writeFileSync(outputFile, content, {encoding: 'utf8'});

console.log('\n✅ Converted to UTF-8!');
console.log('📁 Output:', path.resolve(outputFile));

// Test
try {
  delete require.cache[require.resolve(path.resolve(outputFile))];
  require(path.resolve(outputFile));
  console.log('✅ File syntax valid!\n');
} catch (error) {
  console.log('❌ Error:', error.message, '\n');
}
