import { AppContext } from "../types";

export const requireAuth = () => async (c: AppContext, next: Function) => {
  if (c.get('session') || c.get('jwtClaims')) return next();
  return c.json({ error: { message: 'Unauthorized' }, data: null }, 401);
};

export const requireGuest = () => async (c: AppContext, next: Function) => {
  if (c.get('session') || c.get('jwtClaims')) {
    return c.json({ error: { message: 'Already authenticated' }, data: null }, 403);
  }
  return next();
};

export const requireRole = (...roles: string[]) => async (c: AppContext, next: Function) => {
  const user = c.get('user') as { role?: string | null } | null;
  const claims = c.get('jwtClaims') as { role?: string | null } | undefined;
  const role = user?.role ?? claims?.role ?? null;
  if (role && roles.includes(role)) return next();
  return c.json({ error: { message: 'Forbidden' }, data: null }, 403);
};

export const requireNotBanned = () => async (c: AppContext, next: Function) => {
  const user = c.get('user') as { banned?: boolean | null } | null;
  const claims = c.get('jwtClaims') as { banned?: boolean | null } | undefined;
  const banned = Boolean(user?.banned ?? claims?.banned ?? false);
  if (banned) return c.json({ error: { message: 'Account banned' }, data: null }, 403);
  return next();
};


