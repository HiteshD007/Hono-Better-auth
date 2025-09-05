# Complete Authentication Flow Guide

This document explains the internal workings of all authentication routes and how they interact with Better Auth, JWT tokens, and multi-session management.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Authentication Flow](#authentication-flow)
4. [Route Documentation](#route-documentation)
5. [JWT Token System](#jwt-token-system)
6. [Multi-Session Management](#multi-session-management)
7. [Security Middleware](#security-middleware)
8. [Error Handling](#error-handling)
9. [Testing Examples](#testing-examples)

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Hono Server    │    │   Better Auth   │
│   (Client)      │◄──►│   (API Layer)    │◄──►│   (Auth Core)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   MongoDB        │
                       │   (Database)     │
                       └──────────────────┘
```

### Key Components:
- **Better Auth**: Handles core authentication logic
- **JWT Plugin**: Provides stateless token authentication
- **Multi-Session Plugin**: Manages multiple concurrent sessions
- **Hono Middleware**: Request processing and authorization
- **MongoDB**: Stores user data, sessions, and JWKS

## Database Schema

### User Table
```sql
model User {
  id            String    @id @map("_id")
  name          String
  email         String
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @default(now()) @updatedAt
  role          String?
  banned        Boolean?  @default(false)
  banReason     String?
  banExpires    DateTime?
  sessions      Session[]
  accounts      Account[]
  test          Boolean?  @default(false)
}
```

### Session Table
```sql
model Session {
  id             String   @id @map("_id")
  expiresAt      DateTime
  token          String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  ipAddress      String?
  userAgent      String?
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  impersonatedBy String?
}
```

### JWKS Table (JWT Plugin)
```sql
model JWKS {
  id         String   @id @map("_id")
  publicKey  String
  privateKey String
  createdAt  DateTime @default(now())
}
```

## Authentication Flow

### 1. User Registration
```
POST /api/auth/sign-up
├── Better Auth validates input
├── Creates user in database
├── Generates session token
├── Sets HTTP-only cookie
└── Returns user data
```

### 2. User Login
```
POST /api/auth/sign-in
├── Better Auth validates credentials
├── Creates new session
├── Sets session cookie
├── Triggers multi-session limit check
└── Returns user data
```

### 3. Session Validation (Every Request)
```
Request → Server
├── Extract session cookie
├── Query Better Auth for session
├── If valid: Set user context
├── If invalid: Check JWT token
└── Continue to route handler
```

## Route Documentation

### Authentication Routes (`/api/auth/*`)

#### POST `/api/auth/sign-up`
**Purpose**: Register a new user account

**Internal Flow**:
1. Better Auth receives request
2. Validates email/password format
3. Checks if email already exists
4. Hashes password securely
5. Creates user record in database
6. Generates session token
7. Sets HTTP-only session cookie
8. Emits user creation event to Redis
9. Returns user data (excluding sensitive fields)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-01-01T01:00:00Z"
  }
}
```

#### POST `/api/auth/sign-in`
**Purpose**: Authenticate existing user

**Internal Flow**:
1. Better Auth validates credentials
2. Checks if user exists and is not banned
3. Verifies password hash
4. Creates new session (respects 3-session limit)
5. Sets session cookie
6. Returns user and session data

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### POST `/api/auth/sign-out`
**Purpose**: Terminate user session

**Internal Flow**:
1. Better Auth receives sign-out request
2. Validates current session
3. Revokes ALL user sessions (multi-session cleanup)
4. Clears session cookies
5. Returns success confirmation

#### POST `/api/auth/token`
**Purpose**: Generate JWT token from session

**Internal Flow**:
1. Validates current session exists
2. Creates JWT payload with user data
3. Signs token with JWKS private key
4. Returns access token

**Response**:
```json
{
  "token": "eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/api/auth/jwks`
**Purpose**: Provide public keys for JWT verification

**Internal Flow**:
1. Retrieves current JWKS from database
2. Returns public key set
3. Used by external services to verify JWTs

**Response**:
```json
{
  "keys": [
    {
      "kty": "EC",
      "crv": "P-256",
      "x": "base64-encoded-x",
      "y": "base64-encoded-y",
      "kid": "key-id-123"
    }
  ]
}
```

### Session Management Routes (`/api/sessions/*`)

#### GET `/api/sessions`
**Purpose**: List all active sessions for current user

**Internal Flow**:
1. Validates user authentication
2. Queries database for user's sessions
3. Returns session metadata

**Response**:
```json
{
  "sessions": [
    {
      "id": "session_123",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActiveAt": "2024-01-01T00:30:00Z"
    }
  ]
}
```

#### POST `/api/sessions/set-active`
**Purpose**: Switch to a different session

**Internal Flow**:
1. Validates current user authentication
2. Verifies target session belongs to user
3. Updates session priority
4. Returns success confirmation

#### POST `/api/sessions/revoke`
**Purpose**: Revoke a specific session

**Internal Flow**:
1. Validates user authentication
2. Verifies session belongs to user
3. Deletes session from database
4. Returns success confirmation

### Admin Routes (`/api/admin/*`)

#### GET `/api/admin`
**Purpose**: Admin-only endpoint example

**Internal Flow**:
1. Validates user authentication
2. Checks user role is "admin"
3. Verifies user is not banned
4. Returns admin data

## JWT Token System

### Token Structure
```json
{
  "header": {
    "alg": "ES256",
    "typ": "JWT",
    "kid": "key-id-123"
  },
  "payload": {
    "sub": "user_123",
    "iss": "http://localhost:8000",
    "aud": "http://localhost:8000",
    "exp": 1640995200,
    "iat": 1640991600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

### JWT Verification Process
1. Extract token from `Authorization: Bearer <token>` header
2. Verify signature using JWKS public key
3. Check expiration time
4. Validate issuer and audience
5. Set user context from token payload

### JWKS Key Rotation
- Keys are automatically rotated by Better Auth
- Old keys remain valid until expiration
- New keys are immediately available via `/api/auth/jwks`

## Multi-Session Management

### Session Limit Enforcement
- **Maximum**: 3 concurrent sessions per user
- **Enforcement**: When limit exceeded, oldest session is removed
- **Scope**: Per user, not per device

### Session Lifecycle
```
Login → Create Session → Check Limit → Remove Oldest (if needed) → Return Session
```

### Session Data Stored
- Session ID and token
- User ID (foreign key)
- IP address and user agent
- Creation and expiration timestamps
- Impersonation tracking (for admin features)

## Security Middleware

### Request Processing Pipeline
```
1. CORS Check
   ├── Validate origin
   ├── Check allowed headers
   └── Handle preflight requests

2. Logging
   ├── Log HTTP method and path
   └── Record request metadata

3. Session Extraction
   ├── Extract session cookie
   ├── Query Better Auth for session
   ├── Set user context if valid
   └── Continue to JWT check

4. JWT Verification (if no session)
   ├── Extract Bearer token
   ├── Verify signature with JWKS
   ├── Validate expiration and claims
   └── Set user context from token

5. Route Handler
   ├── Apply authorization middleware
   ├── Execute business logic
   └── Return response
```

### Authorization Middleware

#### `requireAuth()`
- Ensures user is authenticated (session OR JWT)
- Returns 401 if no valid authentication

#### `requireGuest()`
- Ensures user is NOT authenticated
- Used for public routes like sign-up/sign-in
- Returns 403 if already authenticated

#### `requireRole(...roles)`
- Checks user has one of the specified roles
- Works with both session and JWT authentication
- Returns 403 if role doesn't match

#### `requireNotBanned()`
- Ensures user account is not banned
- Checks both session and JWT data
- Returns 403 if user is banned

## Error Handling

### Authentication Errors
- **401 Unauthorized**: No valid session or JWT
- **403 Forbidden**: Insufficient permissions or banned user
- **400 Bad Request**: Invalid input data
- **409 Conflict**: Email already exists (sign-up)

### Error Response Format
```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": "Additional context"
  },
  "data": null
}
```

### Common Error Scenarios
1. **Invalid credentials**: 401 with "Invalid email or password"
2. **Session expired**: 401 with "Session expired"
3. **JWT malformed**: 401 with "Invalid token"
4. **Role insufficient**: 403 with "Insufficient permissions"
5. **User banned**: 403 with "Account suspended"

## Testing Examples

### Complete Authentication Flow Test

#### 1. Register User
```bash
curl -X POST http://localhost:8000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }' \
  -c cookies.txt
```

#### 2. Get JWT Token
```bash
curl -X POST http://localhost:8000/api/auth/token \
  -b cookies.txt
```

#### 3. Use JWT for API Call
```bash
curl -X GET http://localhost:8000/api/sessions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. List Sessions (with session cookie)
```bash
curl -X GET http://localhost:8000/api/sessions \
  -b cookies.txt
```

#### 5. Test Multi-Session Limit
```bash
# Login from different "devices" (simulated with different user agents)
curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -H "User-Agent: Device1" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c device1.txt

curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -H "User-Agent: Device2" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c device2.txt

curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -H "User-Agent: Device3" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c device3.txt

# This 4th login will remove the oldest session
curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -H "User-Agent: Device4" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  -c device4.txt
```

### JWT Verification Test
```bash
# Get JWKS
curl http://localhost:8000/api/auth/jwks

# Verify JWT (using jose library in Node.js)
const jose = require('jose');
const JWKS = jose.createRemoteJWKSet(new URL('http://localhost:8000/api/auth/jwks'));

const { payload } = await jose.jwtVerify(token, JWKS, {
  issuer: 'http://localhost:8000',
  audience: 'http://localhost:8000'
});
```

## Security Considerations

### Session Security
- HTTP-only cookies prevent XSS attacks
- Secure flag for HTTPS environments
- SameSite protection against CSRF
- Automatic session expiration

### JWT Security
- Short expiration times (15 minutes default)
- JWKS rotation for compromised keys
- Signature verification prevents tampering
- No sensitive data in JWT payload

### Multi-Session Security
- Session limit prevents abuse
- IP and user agent tracking
- Automatic cleanup of old sessions
- Admin can revoke all user sessions

### Database Security
- Password hashing with secure algorithms
- No plaintext sensitive data storage
- Encrypted private keys in JWKS
- Proper indexing for performance

## Monitoring and Logging

### Request Logging
- All HTTP requests logged with method and path
- User context included in logs
- Error tracking for failed authentications

### Session Monitoring
- Track active session count per user
- Monitor for suspicious login patterns
- Log session creation and revocation

### Performance Metrics
- JWT verification time
- Database query performance
- Session lookup efficiency
- JWKS key rotation frequency

This comprehensive guide covers all aspects of the authentication system, from high-level architecture to specific implementation details and testing procedures.
