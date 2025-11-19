const fs = require('fs');
const path = require('path');

const sourceFile = path.join('..', 'backend', 'controllers', 'umkmController_utf8.js');
const targetFile = path.join('..', 'backend', 'controllers', 'umkmController.js');

console.log('🔧 Editing umkmController.js...\n');

// Baca file UTF-8
let content = fs.readFileSync(sourceFile, 'utf8');

console.log('Step 1: Removing auto-increment from getUMKMById...');

// Pattern yang lebih spesifik - cari di dalam getUMKMById
const lines = content.split('\n');
const newLines = [];
let inGetById = false;
let skipNext = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Detect getUMKMById function
  if (line.includes('exports.getUMKMById')) {
    inGetById = true;
  }
  
  // Detect end of function (next exports)
  if (inGetById && line.includes('exports.') && !line.includes('exports.getUMKMById')) {
    inGetById = false;
  }
  
  // Skip if we're in skip mode
  if (skipNext > 0) {
    skipNext--;
    continue;
  }
  
  // If in getUMKMById and found increment comment
  if (inGetById && line.trim() === '// Increment views') {
    console.log('Found increment at line', i + 1);
    skipNext = 3; // Skip next 3 lines (umkm.views += 1, await umkm.save(), empty line)
    continue;
  }
  
  newLines.push(line);
}

content = newLines.join('\n');
console.log('✅ Removed auto-increment\n');

console.log('Step 2: Adding incrementView function...');
if (!content.includes('exports.incrementView')) {
  const newFunction = `

// @desc    Increment UMKM view count
// @route   POST /api/umkm/:id/view
// @access  Public
exports.incrementView = async (req, res) => {
  try {
    const umkm = await UMKM.findById(req.params.id);

    if (!umkm) {
      return res.status(404).json({
        success: false,
        message: 'UMKM tidak ditemukan'
      });
    }

    // Increment views
    umkm.views += 1;
    await umkm.save();

    res.status(200).json({
      success: true,
      message: 'View count incremented',
      data: {
        views: umkm.views
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate view count',
      error: error.message
    });
  }
};`;
  
  content += newFunction;
  console.log('✅ Added incrementView function\n');
} else {
  console.log('ℹ️  Already exists\n');
}

// Tulis ke target
fs.writeFileSync(targetFile, content, {encoding: 'utf8'});

console.log('✅ File saved!');
console.log('📁 Target:', path.resolve(targetFile));

// Test
console.log('\n🧪 Testing...');
try {
  delete require.cache[require.resolve(path.resolve(targetFile))];
  require(path.resolve(targetFile));
  console.log('✅ Syntax VALID!\n');
  console.log('🚀 Start server:');
  console.log('   cd "D:\\ALL ABOUT SKRIPSI\\backend"');
  console.log('   npm start\n');
} catch (error) {
  console.log('❌ Error:', error.message);
}
