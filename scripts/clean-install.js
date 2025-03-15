#!/usr/bin/env node

import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Color coding for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m'
};

console.log(`${colors.yellow}Starting clean installation process...${colors.reset}`);

try {
  // Clear npm cache
  console.log(`${colors.yellow}Clearing npm cache...${colors.reset}`);
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // Remove node_modules and package-lock.json
  console.log(`${colors.yellow}Removing node_modules and package-lock.json...${colors.reset}`);
  execSync('if exist node_modules rmdir /s /q node_modules', { stdio: 'inherit' });
  execSync('if exist package-lock.json del package-lock.json', { stdio: 'inherit' });

  // Install dependencies
  console.log(`${colors.yellow}Installing dependencies...${colors.reset}`);
  execSync('npm install', { stdio: 'inherit' });

  console.log(`${colors.green}Clean installation completed successfully!${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Error during clean installation:${colors.reset}`, error.message);
  process.exit(1);
}