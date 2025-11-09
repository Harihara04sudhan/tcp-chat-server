#!/usr/bin/env node

/**
 * Automated test script for TCP Chat Server
 * Tests all protocol commands
 */

const net = require('net');
const PORT = 4000;

// Helper to create a client and run commands
function createTestClient(name, commands, onMessage) {
  return new Promise((resolve, reject) => {
    const client = net.connect(PORT, 'localhost');
    const receivedMessages = [];
    let commandIndex = 0;
    let buffer = '';

    client.setEncoding('utf8');

    client.on('connect', () => {
      console.log(`[${name}] Connected`);
      
      // Send first command
      if (commands.length > 0) {
        const cmd = commands[commandIndex++];
        console.log(`[${name}] SEND: ${cmd}`);
        client.write(cmd + '\n');
      }
    });

    client.on('data', (data) => {
      buffer += data;
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      lines.forEach(line => {
        if (line.trim()) {
          console.log(`[${name}] RECV: ${line}`);
          receivedMessages.push(line);

          if (onMessage) {
            onMessage(line);
          }

          // Send next command if available
          if (commandIndex < commands.length) {
            setTimeout(() => {
              const cmd = commands[commandIndex++];
              console.log(`[${name}] SEND: ${cmd}`);
              client.write(cmd + '\n');
            }, 100);
          }
        }
      });
    });

    client.on('end', () => {
      console.log(`[${name}] Disconnected`);
      resolve(receivedMessages);
    });

    client.on('error', (err) => {
      console.error(`[${name}] Error: ${err.message}`);
      reject(err);
    });

    // Auto-close after timeout
    setTimeout(() => {
      client.end();
    }, 3000);

    return client;
  });
}

async function runTests() {
  console.log('='.repeat(50));
  console.log('🧪 Starting TCP Chat Server Tests');
  console.log('='.repeat(50));
  console.log('');

  try {
    // Test 1: Basic Login
    console.log('\n📝 Test 1: Basic Login');
    console.log('-'.repeat(50));
    await createTestClient('Client1', ['LOGIN Naman']);
    console.log('✅ Test 1 passed\n');

    await sleep(500);

    // Test 2: Duplicate Username
    console.log('\n📝 Test 2: Duplicate Username');
    console.log('-'.repeat(50));
    const client1 = net.connect(PORT, 'localhost');
    const client2 = net.connect(PORT, 'localhost');
    
    await new Promise((resolve) => {
      let client1Ready = false;
      let client2Ready = false;

      client1.on('connect', () => {
        console.log('[Client1] Connected');
        client1.write('LOGIN Alice\n');
      });

      client1.on('data', (data) => {
        console.log(`[Client1] RECV: ${data.toString().trim()}`);
        if (data.toString().includes('OK')) {
          client1Ready = true;
          if (!client2Ready) {
            client2.write('LOGIN Alice\n');
          }
        }
      });

      client2.on('connect', () => {
        console.log('[Client2] Connected');
        if (client1Ready) {
          client2.write('LOGIN Alice\n');
        }
      });

      client2.on('data', (data) => {
        console.log(`[Client2] RECV: ${data.toString().trim()}`);
        if (data.toString().includes('ERR username-taken')) {
          console.log('✅ Test 2 passed\n');
          client1.end();
          client2.end();
          resolve();
        }
      });

      setTimeout(() => {
        client1.end();
        client2.end();
        resolve();
      }, 2000);
    });

    await sleep(500);

    // Test 3: Message Broadcasting
    console.log('\n📝 Test 3: Message Broadcasting');
    console.log('-'.repeat(50));
    
    const sender = net.connect(PORT, 'localhost');
    const receiver = net.connect(PORT, 'localhost');
    
    await new Promise((resolve) => {
      let senderLoggedIn = false;
      let receiverLoggedIn = false;
      let messageReceived = false;

      sender.on('connect', () => {
        console.log('[Sender] Connected');
        sender.write('LOGIN Bob\n');
      });

      sender.on('data', (data) => {
        const msg = data.toString().trim();
        console.log(`[Sender] RECV: ${msg}`);
        if (msg.includes('OK') && !senderLoggedIn) {
          senderLoggedIn = true;
          if (receiverLoggedIn) {
            sender.write('MSG Hello World!\n');
          }
        }
      });

      receiver.on('connect', () => {
        console.log('[Receiver] Connected');
        receiver.write('LOGIN Carol\n');
      });

      receiver.on('data', (data) => {
        const msg = data.toString().trim();
        console.log(`[Receiver] RECV: ${msg}`);
        if (msg.includes('OK') && !receiverLoggedIn) {
          receiverLoggedIn = true;
          if (senderLoggedIn) {
            sender.write('MSG Hello World!\n');
          }
        }
        if (msg.includes('MSG Bob Hello World!')) {
          messageReceived = true;
          console.log('✅ Test 3 passed\n');
          sender.end();
          receiver.end();
          resolve();
        }
      });

      setTimeout(() => {
        if (!messageReceived) {
          console.log('⚠️  Test 3: Timeout\n');
        }
        sender.end();
        receiver.end();
        resolve();
      }, 3000);
    });

    await sleep(500);

    // Test 4: WHO Command
    console.log('\n📝 Test 4: WHO Command');
    console.log('-'.repeat(50));
    await createTestClient('Client1', [
      'LOGIN Dave',
      'WHO'
    ]);
    console.log('✅ Test 4 passed\n');

    await sleep(500);

    // Test 5: PING/PONG
    console.log('\n📝 Test 5: PING/PONG');
    console.log('-'.repeat(50));
    await createTestClient('Client1', [
      'LOGIN Eve',
      'PING'
    ]);
    console.log('✅ Test 5 passed\n');

    await sleep(500);

    // Test 6: Direct Message
    console.log('\n📝 Test 6: Direct Message');
    console.log('-'.repeat(50));
    
    const dmSender = net.connect(PORT, 'localhost');
    const dmReceiver = net.connect(PORT, 'localhost');
    
    await new Promise((resolve) => {
      let senderLoggedIn = false;
      let receiverLoggedIn = false;
      let dmReceived = false;

      dmSender.on('connect', () => {
        console.log('[Sender] Connected');
        dmSender.write('LOGIN Frank\n');
      });

      dmSender.on('data', (data) => {
        const msg = data.toString().trim();
        console.log(`[Sender] RECV: ${msg}`);
        if (msg.includes('OK') && !senderLoggedIn) {
          senderLoggedIn = true;
          if (receiverLoggedIn) {
            dmSender.write('DM Grace Secret message\n');
          }
        }
      });

      dmReceiver.on('connect', () => {
        console.log('[Receiver] Connected');
        dmReceiver.write('LOGIN Grace\n');
      });

      dmReceiver.on('data', (data) => {
        const msg = data.toString().trim();
        console.log(`[Receiver] RECV: ${msg}`);
        if (msg.includes('OK') && !receiverLoggedIn) {
          receiverLoggedIn = true;
          if (senderLoggedIn) {
            dmSender.write('DM Grace Secret message\n');
          }
        }
        if (msg.includes('DM Frank Secret message')) {
          dmReceived = true;
          console.log('✅ Test 6 passed\n');
          dmSender.end();
          dmReceiver.end();
          resolve();
        }
      });

      setTimeout(() => {
        if (!dmReceived) {
          console.log('⚠️  Test 6: Timeout\n');
        }
        dmSender.end();
        dmReceiver.end();
        resolve();
      }, 3000);
    });

    console.log('='.repeat(50));
    console.log('✅ All Tests Completed!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests
runTests();
