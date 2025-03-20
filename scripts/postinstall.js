#!/usr/bin/env node

/**
 * This script handles installation issues with certain dependencies
 * that have problems on newer Node.js versions.
 * 
 * The issue specifically affects @stdlib/number-float64-base-normalize
 * and other stdlib packages that use node-gyp but don't have a binding.gyp file.
 */

const fs = require('fs');
const path = require('path');

function checkNodeVersion() {
  const currentNodeVersion = process.versions.node;
  const majorVersion = parseInt(currentNodeVersion.split('.')[0], 10);
  
  console.log(`Current Node.js version: ${currentNodeVersion}`);
  
  if (majorVersion >= 21) {
    console.warn('\x1b[33m%s\x1b[0m', `Warning: You're using Node.js v${majorVersion}, which may have compatibility issues with some dependencies.`);
    console.warn('\x1b[33m%s\x1b[0m', 'The recommended Node.js version for this package is 12.22 - 20.x.');
    console.warn('\x1b[33m%s\x1b[0m', 'Consider using nvm to switch to a compatible Node.js version.');
    
    // Continue with installation anyway
    console.log('Proceeding with installation...');
  }
}

function fixStdlibIssues() {
  try {
    // Path to the problematic package
    const basePath = path.join(process.cwd(), 'node_modules', '@stdlib', 'number-float64-base-normalize');
    
    // Check if the package exists
    if (fs.existsSync(basePath)) {
      console.log('Checking for missing binding.gyp file...');
      
      // Create an empty binding.gyp file if it doesn't exist
      const bindingGyp = path.join(basePath, 'binding.gyp');
      if (!fs.existsSync(bindingGyp)) {
        // Create a minimal binding.gyp file
        const bindingGyContent = `{
  "targets": [
    {
      "target_name": "stdlib_number_float64_base_normalize",
      "sources": [ ]
    }
  ]
}`;
        
        fs.writeFileSync(bindingGyp, bindingGyContent);
        console.log('Created binding.gyp file for @stdlib/number-float64-base-normalize');
      }
    }
  } catch (error) {
    console.error('Error fixing stdlib issues:', error.message);
    // Don't fail the installation
  }
}

// Run the checks
checkNodeVersion();
fixStdlibIssues();

console.log('Postinstall script completed'); 