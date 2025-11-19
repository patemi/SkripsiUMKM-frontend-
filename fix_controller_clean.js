const fs = require('fs');
const path = require('path');

const sourceFile = path.join('..', 'backend', 'controllers', 'umkmController_clean.js');
const targetFile = path.join('..', 'backend', 'controllers', 'umkmController.js');

console.log('🔧 Fixing umkmController.js...\n');

// Baca file clean
let content = fs.readFileSync(sourceFile, 'utf8');

console.log('Step 1: Removing auto-increment from getUMKMById...');
// Pattern untuk menghapus increment views HANYA di getUMKMById
// Cari setelah "if (!umkm)" dan sebelum "res.status(200)"
const pattern1 = /(exports\.getUMKMById[\s\S]*?if \(!umkm\) \{[\s\S]*?\}\s*\n\s*\n)([ \t]*\/\/ Increment views\s*\n[ \t]*umkm\.views \+= 1;\s*\n[ \t]*await umkm\.save\(\);\s*\n\s*\n)([ \t]*res\.status\(200\))/;

if (pattern1.test(content)) {
  content = content.replace(pattern1, '$1$3');
  console.log('✅ Removed auto-increment from getUMKMById\n');
} else {
  console.log('ℹ️  Auto-increment already removed or pattern not found\n');
}

console.log('Step 2: Adding incrementView function...');
// Cek apakah sudah ada incrementView
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
  console.log('ℹ️  incrementView function already exists\n');
}

// Tulis ke target file
fs.writeFileSync(targetFile, content, 'utf8');

console.log('✅ File saved successfully!');
console.log('📁 Target: ' + path.resolve(targetFile) + '\n');

// Test syntax
console.log('🧪 Testing file syntax...');
try {
  delete require.cache[require.resolve(path.resolve(targetFile))];
  require(path.resolve(targetFile));
  console.log('✅ File syntax is VALID!\n');
  console.log('🚀 Ready to start server!');
  console.log('   Run: cd "D:\\ALL ABOUT SKRIPSI\\backend" && npm start\n');
} catch (error) {
  console.log('❌ Syntax error:', error.message);
}
