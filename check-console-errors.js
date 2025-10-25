// Script to check for potential console errors in the codebase

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Common issues that cause console errors
const issues = [];

// Check for missing imports in our new components
const checkFile = filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);

  // Check for format import from date-fns
  if (
    content.includes('import { format') &&
    !content.includes("from 'date-fns'")
  ) {
    issues.push(`${fileName}: Missing date-fns import`);
  }

  // Check for undefined variables
  if (content.includes('console.error') && !content.includes('catch')) {
    issues.push(`${fileName}: Unhandled console.error`);
  }

  // Check for API calls without error handling
  if (content.includes('fetch') && !content.includes('catch')) {
    issues.push(`${fileName}: Fetch without error handling`);
  }

  // Check for missing key props in map functions
  if (content.includes('.map(') && !content.includes('key=')) {
    // More detailed check needed
    const mapMatches = content.match(/\.map\([^)]*\)[^{]*{[^}]*}/g);
    if (mapMatches) {
      mapMatches.forEach(match => {
        if (!match.includes('key=')) {
          issues.push(`${fileName}: Possible missing key prop in map function`);
        }
      });
    }
  }
};

// Check all our new component files
const componentsDir = path.join(__dirname, 'src/features');
const checkDirectory = dir => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      checkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(filePath);
    }
  });
};

console.log('Checking for potential console errors...\n');
checkDirectory(componentsDir);

if (issues.length > 0) {
  console.log('Potential issues found:');
  issues.forEach(issue => console.log(`  - ${issue}`));
} else {
  console.log('No obvious issues found that would cause console errors.');
}

console.log('\nNote: This is a basic check. Actual runtime errors may vary.');
