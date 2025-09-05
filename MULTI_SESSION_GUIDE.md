# Multi-Session Management Guide

This project now includes Better Auth's multi-session plugin, allowing users to maintain up to 3 concurrent sessions across different devices/browsers.

## Features

- **Maximum 3 sessions per user** - automatically enforced
- **Session management** - list, switch, and revoke sessions
- **Automatic cleanup** - oldest sessions are removed when limit is exceeded
- **JWT + Session support** - works with both authentication methods

## Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Generate Database Schema
```bash
npx @better-auth/cli generate
```

### 3. Set Environment Variables
```bash
export BASE_URL='http://localhost:8000'
export DATABASE_URL='your-mongodb-connection-string'
```

### 4. Start Server
```bash
bun run dev
```

## Client Usage

### Import the Auth Client
```typescript
import { authClient } from './src/auth-client';
```

### List All Sessions
```typescript
const { data, error } = await authClient.multiSession.listDeviceSessions();
console.log(data.sessions); // Array of active sessions
```

### Switch Active Session
```typescript
const { data, error } = await authClient.multiSession.setActive({
  sessionToken: "your-session-token"
});
```

### Revoke a Session
```typescript
const { data, error } = await authClient.multiSession.revoke({
  sessionToken: "session-to-revoke"
});
```

### Sign Out All Sessions
```typescript
await authClient.signOut(); // Revokes all sessions
```

## API Endpoints

### Authentication
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Sign in user
- `POST /api/auth/sign-out` - Sign out (revokes all sessions)
- `POST /api/auth/token` - Get JWT token from session

### Session Management
- `GET /api/sessions` - List all device sessions (requires auth)
- `POST /api/sessions/set-active` - Set active session (requires auth)
- `POST /api/sessions/revoke` - Revoke specific session (requires auth)

### JWT Endpoints
- `GET /api/auth/jwks` - Get JWKS for JWT verification
- `POST /api/auth/token` - Mint JWT from session

## Testing Multi-Session

### 1. Register/Login
```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (this creates session 1)
curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### 2. Get JWT Token
```bash
# Get JWT from session
curl -X POST http://localhost:8000/api/auth/token \
  -b cookies.txt
```

### 3. Test Session Management
```bash
# List sessions (using session cookie)
curl -X GET http://localhost:8000/api/sessions \
  -b cookies.txt

# Or using JWT
curl -X GET http://localhost:8000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Session Limit
Try logging in from different browsers/devices. After 3 sessions, the oldest will be automatically removed.

## Configuration

### Change Maximum Sessions
Edit `src/auth.ts`:
```typescript
multiSession({
  maximumSessions: 5 // Change from 3 to 5
})
```

### Custom Session Management
The plugin automatically handles:
- Session creation on login
- Session cleanup when limit exceeded
- Session validation
- Cross-device session management

## Security Notes

- Sessions are tied to user accounts
- JWT tokens can be used for stateless authentication
- All session operations require authentication
- Sessions are automatically cleaned up on logout
- Maximum session limit prevents abuse

## Troubleshooting

1. **Session limit reached**: Oldest session is automatically removed
2. **JWT verification fails**: Check BASE_URL matches issuer/audience
3. **Database errors**: Run `npx @better-auth/cli generate` to update schema
4. **CORS issues**: Update CORS settings in `src/server.ts` for your frontend domain
