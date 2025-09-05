import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwksUrl() {
  const base = process.env.BASE_URL ?? "http://localhost:8000";
  return new URL("/api/auth/jwks", base);
}

export async function verifyViaJwks(token: string) {
  if (!remoteJwks) {
    remoteJwks = createRemoteJWKSet(getJwksUrl());
  }
  const issuer = process.env.BASE_URL ?? "http://localhost:8000";
  const audience = issuer;
  const { payload } = await jwtVerify(token, remoteJwks, { issuer, audience });
  return payload as JWTPayload;
}


