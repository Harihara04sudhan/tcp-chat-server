#!/usr/bin/env node

/**
 * TCP Chat Server - Backend Assignment
 * Uses ONLY Node.js standard library (net module)
 * No HTTP, no frameworks, no external libraries
 */

const net = require('net');

// Configuration
const PORT = process.env.PORT || 4000;
const IDLE_TIMEOUT = 60000; // 60 seconds

// Store connected clients: Map<socket, {username, lastActivity}>
const clients = new Map();

// Store usernames to prevent duplicates: Set<username>
const usernames = new Set();

/**
 * Broadcast message to all connected clients
 */
function broadcast(message, excludeSocket = null) {
  clients.forEach((client, socket) => {
    if (socket !== excludeSocket && client.username) {
      socket.write(message + '\n');
    }
  });
}

/**
 * Send message to a specific client
 */
function sendTo(socket, message) {
  if (socket && !socket.destroyed) {
    socket.write(message + '\n');
  }
}

/**
 * Handle LOGIN command
 */
function handleLogin(socket, username) {
  // Validate username
  if (!username || username.trim().length === 0) {
    sendTo(socket, 'ERR invalid-username');
    return;
  }

  username = username.trim();

  // Check if username is already taken
  if (usernames.has(username)) {
    sendTo(socket, 'ERR username-taken');
    return;
  }

  // Register the user
  const client = clients.get(socket);
  client.username = username;
  client.lastActivity = Date.now();
  usernames.add(username);

  sendTo(socket, 'OK');
  console.log(`[LOGIN] ${username} logged in`);

  // Notify other users
  broadcast(`INFO ${username} joined`, socket);
}

/**
 * Handle MSG command
 */
function handleMessage(socket, text) {
  const client = clients.get(socket);

  if (!client || !client.username) {
    sendTo(socket, 'ERR not-logged-in');
    return;
  }

  if (!text || text.trim().length === 0) {
    sendTo(socket, 'ERR empty-message');
    return;
  }

  // Update last activity
  client.lastActivity = Date.now();

  // Clean the message text
  const cleanText = text.trim();

  // Broadcast to all users including sender
  const message = `MSG ${client.username} ${cleanText}`;
  broadcast(message);
  console.log(`[MSG] ${client.username}: ${cleanText}`);
}

/**
 * Handle WHO command - list all active users
 */
function handleWho(socket) {
  const client = clients.get(socket);

  if (!client || !client.username) {
    sendTo(socket, 'ERR not-logged-in');
    return;
  }

  // Update last activity
  client.lastActivity = Date.now();

  // Send list of all logged-in users
  usernames.forEach(username => {
    sendTo(socket, `USER ${username}`);
  });

  console.log(`[WHO] ${client.username} requested user list`);
}

/**
 * Handle DM command - private message
 */
function handleDirectMessage(socket, targetUsername, text) {
  const client = clients.get(socket);

  if (!client || !client.username) {
    sendTo(socket, 'ERR not-logged-in');
    return;
  }

  if (!targetUsername || !text || text.trim().length === 0) {
    sendTo(socket, 'ERR invalid-dm-format');
    return;
  }

  // Update last activity
  client.lastActivity = Date.now();

  // Find target user's socket
  let targetSocket = null;
  clients.forEach((targetClient, sock) => {
    if (targetClient.username === targetUsername.trim()) {
      targetSocket = sock;
    }
  });

  if (!targetSocket) {
    sendTo(socket, `ERR user-not-found ${targetUsername}`);
    return;
  }

  // Send private message
  const cleanText = text.trim();
  sendTo(targetSocket, `DM ${client.username} ${cleanText}`);
  sendTo(socket, `DM-SENT ${targetUsername} ${cleanText}`);
  console.log(`[DM] ${client.username} -> ${targetUsername}: ${cleanText}`);
}

/**
 * Handle PING command - heartbeat
 */
function handlePing(socket) {
  const client = clients.get(socket);
  
  if (client) {
    client.lastActivity = Date.now();
  }
  
  sendTo(socket, 'PONG');
}

/**
 * Handle client disconnect
 */
function handleDisconnect(socket) {
  const client = clients.get(socket);

  if (client && client.username) {
    console.log(`[DISCONNECT] ${client.username}`);
    
    // Remove from usernames set
    usernames.delete(client.username);
    
    // Notify other users
    broadcast(`INFO ${client.username} disconnected`);
  } else {
    console.log(`[DISCONNECT] Anonymous client`);
  }

  // Remove from clients map
  clients.delete(socket);
}

/**
 * Process incoming data from client
 */
function processCommand(socket, data) {
  const line = data.toString().trim();
  
  if (line.length === 0) {
    return;
  }

  console.log(`[RECV] ${line}`);

  // Parse command
  const parts = line.split(' ');
  const command = parts[0].toUpperCase();

  switch (command) {
    case 'LOGIN':
      const username = parts.slice(1).join(' ');
      handleLogin(socket, username);
      break;

    case 'MSG':
      const message = parts.slice(1).join(' ');
      handleMessage(socket, message);
      break;

    case 'WHO':
      handleWho(socket);
      break;

    case 'DM':
      if (parts.length < 3) {
        sendTo(socket, 'ERR invalid-dm-format');
        break;
      }
      const targetUser = parts[1];
      const dmText = parts.slice(2).join(' ');
      handleDirectMessage(socket, targetUser, dmText);
      break;

    case 'PING':
      handlePing(socket);
      break;

    default:
      sendTo(socket, `ERR unknown-command ${command}`);
      break;
  }
}

/**
 * Check for idle clients and disconnect them
 * COMMENTED OUT - Uncomment if you want idle timeout feature
 */
/*
function checkIdleClients() {
  const now = Date.now();
  
  clients.forEach((client, socket) => {
    if (client.username && (now - client.lastActivity) > IDLE_TIMEOUT) {
      console.log(`[IDLE-TIMEOUT] ${client.username}`);
      sendTo(socket, 'INFO disconnected due to inactivity');
      socket.end();
    }
  });
}

// Start idle timeout checker every 10 seconds
setInterval(checkIdleClients, 10000);
*/

/**
 * Create TCP server
 */
const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[CONNECT] New connection from ${clientAddress}`);

  // Add client to the map
  clients.set(socket, {
    username: null,
    lastActivity: Date.now()
  });

  // Handle incoming data
  socket.on('data', (data) => {
    // Split by newlines in case multiple commands come at once
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim().length > 0) {
        processCommand(socket, line);
      }
    });
  });

  // Handle client disconnect
  socket.on('end', () => {
    handleDisconnect(socket);
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error(`[ERROR] ${clientAddress}: ${err.message}`);
    handleDisconnect(socket);
  });

  // Set socket encoding
  socket.setEncoding('utf8');
});

// Handle server errors
server.on('error', (err) => {
  console.error(`[SERVER ERROR] ${err.message}`);
  process.exit(1);
});

// Start the server
server.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('TCP Chat Server Started');
  console.log('='.repeat(50));
  console.log(`Port: ${PORT}`);
  // console.log(`Idle Timeout: ${IDLE_TIMEOUT / 1000} seconds`); // COMMENTED OUT
  console.log(`\nConnect using: nc localhost ${PORT}`);
  console.log(`Or: telnet localhost ${PORT}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Closing server...');
  
  // Notify all clients
  broadcast('INFO server shutting down');
  
  // Close all client connections
  clients.forEach((client, socket) => {
    socket.end();
  });
  
  // Close server
  server.close(() => {
    console.log('[SHUTDOWN] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] Received SIGTERM');
  process.kill(process.pid, 'SIGINT');
});
