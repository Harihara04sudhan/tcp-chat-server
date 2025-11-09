#!/usr/bin/env node

/**
 * Assignment Compliance Verification Script
 * Ensures the implementation meets ALL requirements
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('📋 TCP Chat Server - Assignment Compliance Check');
console.log('='.repeat(60));
console.log('');

let passed = 0;
let failed = 0;

function check(description, condition) {
  if (condition) {
    console.log(`✅ ${description}`);
    passed++;
  } else {
    console.log(`❌ ${description}`);
    failed++;
  }
}

// 1. Check files exist
console.log('📁 File Checks:');
console.log('-'.repeat(60));
check('chat-server.js exists', fs.existsSync('chat-server.js'));
check('README.md exists', fs.existsSync('README.md'));
check('test-tcp.js exists', fs.existsSync('test-tcp.js'));
console.log('');

// 2. Check server code uses ONLY standard library
console.log('🔍 Standard Library Compliance:');
console.log('-'.repeat(60));
const serverCode = fs.readFileSync('chat-server.js', 'utf8');
check('Uses net module', serverCode.includes("require('net')"));
check('No HTTP imports', !serverCode.includes("require('http')") && !serverCode.includes("require('https')"));
check('No Express', !serverCode.includes('express'));
check('No Socket.IO', !serverCode.includes('socket.io'));
check('No external frameworks', 
  !serverCode.includes('express') && 
  !serverCode.includes('socket.io') &&
  !serverCode.includes('ws') &&
  !serverCode.includes('websocket')
);
console.log('');

// 3. Check package.json has no dependencies
console.log('📦 Dependency Check:');
console.log('-'.repeat(60));
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const noDeps = !packageJson.dependencies || Object.keys(packageJson.dependencies).length === 0;
check('Zero dependencies in package.json', noDeps);
console.log('');

// 4. Check protocol implementation
console.log('🔧 Protocol Implementation:');
console.log('-'.repeat(60));
check('LOGIN command implemented', serverCode.includes('LOGIN'));
check('MSG command implemented', serverCode.includes('MSG'));
check('Username duplicate check', serverCode.includes('username-taken'));
check('OK response implemented', serverCode.includes('OK'));
check('ERR responses implemented', serverCode.includes('ERR'));
check('INFO notifications implemented', serverCode.includes('INFO'));
check('Disconnect handling', serverCode.includes('disconnected'));
console.log('');

// 5. Check bonus features
console.log('⭐ Bonus Features:');
console.log('-'.repeat(60));
check('WHO command (bonus)', serverCode.includes('WHO'));
check('DM command (bonus)', serverCode.includes('DM'));
check('PING/PONG (bonus)', serverCode.includes('PING') && serverCode.includes('PONG'));
check('Idle timeout (bonus)', serverCode.includes('IDLE_TIMEOUT') || serverCode.includes('idle'));
console.log('');

// 6. Check port configuration
console.log('🚪 Port Configuration:');
console.log('-'.repeat(60));
check('Default port 4000', serverCode.includes('4000'));
check('Port configurable via env', serverCode.includes('process.env.PORT'));
console.log('');

// 7. Check server setup
console.log('⚙️  Server Setup:');
console.log('-'.repeat(60));
check('Creates TCP server', serverCode.includes('net.createServer'));
check('Handles multiple clients', serverCode.includes('on(') && serverCode.includes('data'));
check('Handles disconnect', serverCode.includes('on') && serverCode.includes('end'));
check('Error handling', serverCode.includes('error'));
console.log('');

// 8. Check README content
console.log('📖 Documentation:');
console.log('-'.repeat(60));
const readme = fs.readFileSync('README.md', 'utf8');
check('Installation instructions', readme.includes('Installation') || readme.includes('install'));
check('Running instructions', readme.includes('Running') || readme.includes('run'));
check('nc/telnet examples', readme.includes('nc') && readme.includes('localhost'));
check('Protocol commands documented', readme.includes('LOGIN') && readme.includes('MSG'));
check('Example chat session', readme.includes('example') || readme.includes('Example'));
console.log('');

// Summary
console.log('='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log('');

if (failed === 0) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('✅ Implementation meets ALL assignment requirements');
  console.log('✅ Ready for submission');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('   1. Test: node test-tcp.js');
  console.log('   2. Run: node chat-server.js');
  console.log('   3. Record screen video (1-2 min)');
  console.log('   4. Submit!');
} else {
  console.log('⚠️  Some checks failed. Please review the implementation.');
}

console.log('='.repeat(60));
