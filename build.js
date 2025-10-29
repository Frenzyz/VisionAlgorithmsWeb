import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building Vision Algorithms Website...\n');

try {
  // Clean previous build
  console.log('📝 Cleaning previous build...');
  if (fs.existsSync(path.join(__dirname, 'css/output.css'))) {
    fs.unlinkSync(path.join(__dirname, 'css/output.css'));
  }

  // Build Tailwind CSS
  console.log('🎨 Building Tailwind CSS...');
  execSync('npx tailwindcss -i css/style.css -o css/output.css', {
    cwd: __dirname,
    stdio: 'inherit'
  });

  // Validate build
  console.log('🔍 Validating build...');

  // Check if output CSS exists
  if (!fs.existsSync(path.join(__dirname, 'css/output.css'))) {
    throw new Error('CSS build failed - output.css not found');
  }

  // Check if HTML file exists and has correct CSS reference
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  if (!htmlContent.includes('css/output.css')) {
    throw new Error('HTML file does not reference built CSS');
  }

  // Check if icons exist
  const icons = ['discord.svg', 'reddit.svg', 'steam.svg', 'email.svg'];
  for (const icon of icons) {
    if (!fs.existsSync(path.join(__dirname, 'icons', icon))) {
      throw new Error(`Missing icon: ${icon}`);
    }
  }

  // Check if JavaScript file is valid
  const jsContent = fs.readFileSync(path.join(__dirname, 'js/script.js'), 'utf8');
  if (jsContent.includes('Unterminated template literal')) {
    throw new Error('JavaScript file has syntax errors');
  }

  console.log('\n✅ Build completed successfully!');
  console.log('📁 Files generated:');
  console.log('   - css/output.css (Tailwind CSS)');
  console.log('   - All SVG icons in icons/ directory');
  console.log('\n🌐 To run the website:');
  console.log('   npm run serve');
  console.log('   or');
  console.log('   node server.js');

} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(error.message);
  process.exit(1);
}
