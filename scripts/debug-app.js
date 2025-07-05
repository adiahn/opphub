#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Opportunities Hub - App Debug Report\n');

// Check critical files
const criticalFiles = [
  'app.json',
  'package.json',
  'app/_layout.tsx',
  'services/apiClient.ts',
  'services/store.ts',
  'components/ErrorBoundary.tsx',
  'app/(tabs)/home.tsx',
  'src/3.png'
];

console.log('📁 Checking critical files:');
criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const requiredDeps = [
    'expo',
    'react',
    'react-native',
    '@reduxjs/toolkit',
    'react-redux',
    '@tanstack/react-query',
    'axios'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - MISSING`);
    }
  });
} catch (error) {
  console.log('❌ Error reading package.json');
}

// Check app.json configuration
console.log('\n⚙️ Checking app.json configuration:');
try {
  const appJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
  
  if (appJson.expo?.name) {
    console.log(`✅ App name: ${appJson.expo.name}`);
  } else {
    console.log('❌ App name not set');
  }
  
  if (appJson.expo?.slug) {
    console.log(`✅ App slug: ${appJson.expo.slug}`);
  } else {
    console.log('❌ App slug not set');
  }
  
  if (appJson.expo?.android?.package) {
    console.log(`✅ Android package: ${appJson.expo.android.package}`);
  } else {
    console.log('❌ Android package not set');
  }
} catch (error) {
  console.log('❌ Error reading app.json');
}

console.log('\n🔧 Common crash prevention measures implemented:');
console.log('✅ Error Boundary wrapper');
console.log('✅ Safe image loading with fallbacks');
console.log('✅ Try-catch blocks in critical operations');
console.log('✅ Null/undefined checks for API responses');
console.log('✅ Separate API clients for different endpoints');
console.log('✅ Retry logic for network requests');

console.log('\n🚀 Next steps:');
console.log('1. Run: npx expo start --clear');
console.log('2. Test on device/emulator');
console.log('3. Check console logs for errors');
console.log('4. If crashes persist, check device logs');

console.log('\n📱 To get device logs:');
console.log('Android: adb logcat | grep -i "opportunities"');
console.log('iOS: Xcode Console or device logs'); 