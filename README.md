# TCP Chat Server - Backend Assignment

A simple TCP chat server built using **ONLY Node.js standard library** (`net` module). No HTTP, no frameworks, no external libraries.

## Features

✅ **Raw TCP Socket Server** - Uses Node.js `net` module only  
✅ **Multi-client Support** - Handles 5-10+ concurrent users  
✅ **Port 4000** - Default port (configurable via environment variable)  
✅ **LOGIN Protocol** - Username validation and duplicate prevention  
✅ **Message Broadcasting** - Real-time message delivery to all users  
✅ **Disconnect Notifications** - Notifies all users when someone leaves  
✅ **WHO Command** - List all active users (bonus)  
✅ **Direct Messaging** - Private messages between users (bonus)  
✅ **PING/PONG** - Heartbeat mechanism (bonus)  
✅ **Idle Timeout** - Disconnects inactive users after 60 seconds (bonus)  

## Requirements

- **Node.js** (v14 or higher)
- **No external dependencies** - Uses only standard library

## Installation

```bash
# No npm install needed - uses only standard library!
# Just make sure you have Node.js installed
node --version
```

## Running the Server

### Default (Port 4000)
```bash
node chat-server.js
```

### Custom Port
```bash
PORT=5000 node chat-server.js
```

You should see:
```
==================================================
🚀 TCP Chat Server Started
==================================================
Port: 4000
Idle Timeout: 60 seconds

Connect using: nc localhost 4000
Or: telnet localhost 4000
==================================================
```

## Connecting to the Server

### Using netcat (nc)
```bash
nc localhost 4000
```

### Using telnet
```bash
telnet localhost 4000
```

### Using Node.js (for testing)
```bash
node -e "require('net').connect(4000, 'localhost').pipe(process.stdout); process.stdin.pipe(require('net').connect(4000, 'localhost'))"
```

## Protocol Commands

### 1. LOGIN - Log in with a username
```
LOGIN <username>
```

**Response:**
- `OK` - Login successful
- `ERR username-taken` - Username already in use
- `ERR invalid-username` - Invalid username

**Example:**
```
LOGIN Naman
OK
```

---

### 2. MSG - Send a message to all users
```
MSG <text>
```

**Response:**
- Broadcasts to all users: `MSG <username> <text>`
- `ERR not-logged-in` - Must login first
- `ERR empty-message` - Message cannot be empty

**Example:**
```
MSG Hello everyone!
MSG Naman Hello everyone!
```

---

### 3. WHO - List all active users (Bonus)
```
WHO
```

**Response:**
- `USER <username>` - One line per user
- `ERR not-logged-in` - Must login first

**Example:**
```
WHO
USER Naman
USER Yudi
USER Alice
```

---

### 4. DM - Send a private message (Bonus)
```
DM <username> <text>
```

**Response:**
- Recipient receives: `DM <sender> <text>`
- Sender receives: `DM-SENT <recipient> <text>`
- `ERR not-logged-in` - Must login first
- `ERR user-not-found <username>` - User doesn't exist
- `ERR invalid-dm-format` - Invalid command format

**Example:**
```
DM Yudi Hey, how are you?
DM-SENT Yudi Hey, how are you?
```

---

### 5. PING - Heartbeat check (Bonus)
```
PING
```

**Response:**
- `PONG`

**Example:**
```
PING
PONG
```

---

### Automatic Notifications

#### User Joins
When a user logs in, all other users receive:
```
INFO <username> joined
```

#### User Disconnects
When a user disconnects, all remaining users receive:
```
INFO <username> disconnected
```

#### Idle Timeout
Users inactive for 60+ seconds receive:
```
INFO disconnected due to inactivity
```

---

## Example Chat Session

### Client 1 (Naman)
```bash
$ nc localhost 4000
LOGIN Naman
OK
MSG hi everyone!
MSG Naman hi everyone!
MSG how are you?
MSG Naman how are you?
INFO Yudi joined
MSG Yudi hello Naman!
WHO
USER Naman
USER Yudi
DM Yudi private message
DM-SENT Yudi private message
```

### Client 2 (Yudi)
```bash
$ nc localhost 4000
LOGIN Yudi
OK
INFO Yudi joined
MSG Naman hi everyone!
MSG Naman how are you?
MSG hello Naman!
MSG Yudi hello Naman!
WHO
USER Naman
USER Yudi
DM Naman private message
```

When Naman disconnects:
```
INFO Naman disconnected
```

### Client 3 (Duplicate Username Test)
```bash
$ nc localhost 4000
LOGIN Naman
ERR username-taken
LOGIN Alice
OK
MSG hi from Alice!
MSG Alice hi from Alice!
```

---

## Testing the Server

### Test 1: Basic Login and Messaging

**Terminal 1:**
```bash
nc localhost 4000
```
```
LOGIN Naman
MSG hi everyone!
```

**Terminal 2:**
```bash
nc localhost 4000
```
```
LOGIN Yudi
MSG hello Naman!
```

**Expected Output (Terminal 1):**
```
OK
MSG Naman hi everyone!
INFO Yudi joined
MSG Yudi hello Naman!
```

**Expected Output (Terminal 2):**
```
OK
INFO Yudi joined
MSG Naman hi everyone!
MSG Yudi hello Naman!
```

---

### Test 2: Duplicate Username

**Terminal 1:**
```bash
nc localhost 4000
```
```
LOGIN Naman
```
Output: `OK`

**Terminal 2:**
```bash
nc localhost 4000
```
```
LOGIN Naman
```
Output: `ERR username-taken`

---

### Test 3: WHO Command

**Terminal 1:**
```
LOGIN Alice
WHO
```
Output:
```
OK
USER Alice
```

**Terminal 2:**
```
LOGIN Bob
WHO
```
Output:
```
OK
INFO Bob joined
USER Alice
USER Bob
```

---

### Test 4: Direct Messages

**Terminal 1 (Alice):**
```
LOGIN Alice
DM Bob secret message
```

**Terminal 2 (Bob):**
```
LOGIN Bob
```

Bob receives:
```
DM Alice secret message
```

Alice receives:
```
DM-SENT Bob secret message
```

---

### Test 5: Disconnect Notification

**Terminal 1:**
```
LOGIN Alice
```

**Terminal 2:**
```
LOGIN Bob
```

Now close Terminal 1 (Ctrl+C or Ctrl+D).

**Terminal 2 sees:**
```
INFO Alice disconnected
```

---

## Server Logs

The server logs all activities to the console:

```
[CONNECT] New connection from ::1:54321
[LOGIN] Naman logged in
[MSG] Naman: hi everyone!
[CONNECT] New connection from ::1:54322
[LOGIN] Yudi logged in
[MSG] Yudi: hello Naman!
[WHO] Naman requested user list
[DM] Naman -> Yudi: private message
[DISCONNECT] Naman
```

---

## Protocol Summary

| Command | Format | Response |
|---------|--------|----------|
| LOGIN | `LOGIN <username>` | `OK` or `ERR username-taken` |
| MSG | `MSG <text>` | Broadcasts `MSG <username> <text>` |
| WHO | `WHO` | `USER <username>` (one per user) |
| DM | `DM <username> <text>` | `DM <sender> <text>` (to recipient) |
| PING | `PING` | `PONG` |

---

## Error Messages

| Error | Meaning |
|-------|---------|
| `ERR username-taken` | Username already in use |
| `ERR invalid-username` | Username is empty or invalid |
| `ERR not-logged-in` | Must login before sending commands |
| `ERR empty-message` | Message text cannot be empty |
| `ERR invalid-dm-format` | DM command format is incorrect |
| `ERR user-not-found <username>` | Target user doesn't exist |
| `ERR unknown-command <cmd>` | Command not recognized |

---

## Technical Details

### Implementation
- **Language:** JavaScript (Node.js)
- **Standard Library:** `net` module only
- **No External Dependencies:** Zero npm packages
- **Protocol:** Text-based, line-delimited
- **Encoding:** UTF-8
- **Port:** 4000 (configurable)

### Architecture
- Single-file implementation
- Event-driven socket handling
- In-memory user storage (Map and Set)
- Concurrent connection support
- Graceful shutdown handling

### Features Implemented

**Required:**
- ✅ TCP server on port 4000
- ✅ Multiple concurrent clients
- ✅ LOGIN command with duplicate prevention
- ✅ MSG broadcasting
- ✅ Disconnect notifications

**Bonus:**
- ✅ WHO command (list users)
- ✅ DM command (private messages)
- ✅ PING/PONG heartbeat
- ✅ 60-second idle timeout

---

## Screen Recording

**Video Link:** [To be added]

The video demonstrates:
1. Starting the server
2. Connecting two clients (using `nc`)
3. Logging in with different usernames
4. Sending messages back and forth
5. Using WHO command
6. Sending a direct message
7. Disconnecting a client
8. Testing duplicate username rejection

---

## Deployment

### Local Testing
```bash
node chat-server.js
```

### Production Deployment

**Option 1: Using PM2**
```bash
npm install -g pm2
pm2 start chat-server.js --name "tcp-chat"
```

**Option 2: Using systemd**
```bash
# Create service file: /etc/systemd/system/tcp-chat.service
[Unit]
Description=TCP Chat Server
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/chat-server
ExecStart=/usr/bin/node chat-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

### Cloud Deployment
If deploying to a cloud server:
- Open TCP port 4000 in firewall
- Use the server's public IP address
- Connect with: `nc <server-ip> 4000`

**Example:**
```bash
nc 203.0.113.42 4000
```

---

## Troubleshooting

### Port already in use
```bash
# Find process using port 4000
lsof -i :4000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5000 node chat-server.js
```

### Connection refused
- Make sure the server is running
- Check if port 4000 is open
- Verify firewall settings

### Messages not appearing
- Ensure you've logged in first (`LOGIN <username>`)
- Check server logs for errors
- Verify network connectivity

---

## File Structure

```
.
├── chat-server.js          # Main TCP server (ONLY file needed!)
└── README.md               # This file
```

---

## Standards Compliance

✅ **Uses ONLY standard library** - No frameworks, no external libraries  
✅ **Raw TCP sockets** - Using Node.js `net` module  
✅ **No HTTP** - Pure TCP protocol  
✅ **Text-based protocol** - Simple, human-readable commands  
✅ **Line-delimited** - Commands separated by newlines  
✅ **Port 4000** - As specified in requirements  

---

## Author

Created for AlgoKart Backend Assignment

## License

ISC
