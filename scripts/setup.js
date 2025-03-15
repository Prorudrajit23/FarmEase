#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}Starting FarmEase project setup...${colors.reset}\n`);

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log(`${colors.yellow}Creating .env file from .env.example...${colors.reset}`);
  fs.copyFileSync(envExamplePath, envPath);
  console.log(`${colors.green}Created .env file. Please update it with your own values.${colors.reset}\n`);
}

// Install dependencies
try {
  console.log(`${colors.blue}Installing dependencies...${colors.reset}`);
  console.log(`${colors.yellow}This may take a few minutes.${colors.reset}\n`);
  
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  
  console.log(`\n${colors.green}All dependencies installed successfully!${colors.reset}\n`);
} catch (error) {
  console.error(`\n${colors.red}Error installing dependencies:${colors.reset}`, error.message);
  process.exit(1);
}

console.log(`${colors.green}Setup completed successfully!${colors.reset}`);
console.log(`${colors.blue}To start the development server, run:${colors.reset}`);
console.log(`${colors.yellow}npm run dev${colors.reset}\n`);
console.log(`${colors.blue}Don't forget to update your .env file with your own values.${colors.reset}`); 