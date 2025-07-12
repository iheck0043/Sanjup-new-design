#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const publicFiles = [
  "Logo-Sanjup.png",
  "Logo-Sanjup-blue.png",
  "favicon.ico",
  "Sanjup_fav.ico",
  "robots.txt",
];

// Check in public directory
console.log("🔍 Checking public directory...");
const publicDir = path.join(__dirname, "..", "public");
if (fs.existsSync(publicDir)) {
  publicFiles.forEach((file) => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found: public/${file}`);
    } else {
      console.log(`❌ Missing: public/${file}`);
    }
  });
} else {
  console.log("❌ Public directory not found!");
}

// Check in dist directory (after build)
console.log("\n🔍 Checking dist directory...");
const distDir = path.join(__dirname, "..", "dist");
if (fs.existsSync(distDir)) {
  publicFiles.forEach((file) => {
    const filePath = path.join(distDir, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ Found: dist/${file} (${stats.size} bytes)`);
    } else {
      console.log(`❌ Missing: dist/${file}`);
    }
  });
} else {
  console.log('❌ Dist directory not found! Run "npm run build" first.');
}

// List all files in dist root
if (fs.existsSync(distDir)) {
  console.log("\n📁 All files in dist root:");
  const files = fs.readdirSync(distDir);
  files.forEach((file) => {
    const filePath = path.join(distDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      console.log(`  ${file} (${stats.size} bytes)`);
    } else {
      console.log(`  ${file}/ (directory)`);
    }
  });
}
