# Quick Start Guide - TCP Chat Server

## ✅ Assignment Compliance

**This implementation follows the assignment requirements EXACTLY:**
- ✅ Raw TCP socket server (no HTTP)
- ✅ Standard library ONLY (`net` module)
- ✅ No frameworks or external libraries
- ✅ Port 4000
- ✅ All required + bonus features

---

## 🚀 Run the Server

```bash
node chat-server.js
```

---

## 💬 Connect Clients

**Terminal 1:**
```bash
nc localhost 4000
LOGIN Naman
MSG hi everyone!
```

**Terminal 2:**
```bash
nc localhost 4000
LOGIN Yudi
MSG hello Naman!
```

---

## 🧪 Run Tests

```bash
node test-tcp.js
```

**Expected:** All 6 tests pass ✅

---

## 📋 Protocol Commands

```
LOGIN <username>        # Log in
MSG <text>              # Send message
WHO                     # List users (bonus)
DM <user> <text>        # Private message (bonus)
PING                    # Heartbeat (bonus)
```

---

## 📹 Screen Recording Checklist

1. Start server: `node chat-server.js`
2. Open 2 terminals with `nc localhost 4000`
3. Login both: `LOGIN Naman`, `LOGIN Yudi`
4. Send messages: `MSG hello!`
5. Show WHO command
6. Show disconnect notification
7. Test duplicate username rejection

**Duration:** 1-2 minutes

---

## 📁 Files to Submit

1. **chat-server.js** - Main server (ONLY file needed!)
2. **README-TCP.md** - Documentation
3. **Screen recording** - Video link

---

## ✅ Verification

Run this checklist:
- [ ] Server uses ONLY `net` module (no external libs)
- [ ] Server runs on port 4000
- [ ] LOGIN command works with duplicate prevention
- [ ] MSG broadcasts to all users
- [ ] Disconnect notifications work
- [ ] WHO, DM, PING commands work (bonus)
- [ ] All tests pass: `node test-tcp.js`
- [ ] Screen recording shows 2+ clients chatting

---

## 🎯 Assignment Requirements Met

| Requirement | Status |
|-------------|--------|
| TCP server (not HTTP) | ✅ |
| Standard library only | ✅ |
| Port 4000 | ✅ |
| Multiple clients | ✅ |
| LOGIN protocol | ✅ |
| MSG broadcasting | ✅ |
| Disconnect handling | ✅ |
| WHO command | ✅ Bonus |
| DM command | ✅ Bonus |
| PING/PONG | ✅ Bonus |
| Idle timeout | ✅ Bonus |

---

**READY FOR SUBMISSION** ✅
