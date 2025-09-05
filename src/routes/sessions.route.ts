import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { requireAuth } from "../utils/authz";
import type { Bindings, Variables } from "../types";

const sessionsApp = new OpenAPIHono<{
  Bindings: Bindings,
  Variables: Variables
}>();

// Apply auth middleware to all session routes
sessionsApp.use("*", requireAuth());

// List device sessions route
const listSessionsRoute = createRoute({
  method: "get",
  path: "/sessions",
  summary: "List all device sessions",
  tags: ['Sessions'],
  responses: {
    200: {
      description: "List of active sessions",
      content: {
        "application/json": {
          schema: z.object({
            sessions: z.array(z.object({
              id: z.string(),
              userAgent: z.string().optional(),
              ipAddress: z.string().optional(),
              createdAt: z.string(),
              lastActiveAt: z.string().optional(),
            }))
          })
        }
      }
    },
    401: {
      description: "Unauthorized",
      content: {
        "application/json": {
          schema: z.object({
            error: z.object({
              message: z.string()
            })
          })
        }
      }
    }
  }
});

// Revoke session route
const revokeSessionRoute = createRoute({
  method: "post",
  path: "/sessions/revoke",
  summary: "Revoke a specific session",
  tags: ['Sessions'],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            sessionToken: z.string()
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Session revoked successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean()
          })
        }
      }
    },
    401: {
      description: "Unauthorized"
    },
    400: {
      description: "Bad request"
    }
  }
});

// Set active session route
const setActiveSessionRoute = createRoute({
  method: "post",
  path: "/sessions/set-active",
  summary: "Set active session",
  tags: ['Sessions'],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            sessionToken: z.string()
          })
        }
      }
    }
  },
  responses: {
    200: {
      description: "Session set as active",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean()
          })
        }
      }
    },
    401: {
      description: "Unauthorized"
    },
    400: {
      description: "Bad request"
    }
  }
});

// Example implementation - these would typically call the Better Auth multi-session methods
sessionsApp.openapi(listSessionsRoute, async (c) => {
  // In a real implementation, you'd call the multi-session API
  // For now, return mock data
  return c.json({
    sessions: [
      {
        id: "session-1",
        userAgent: "Mozilla/5.0...",
        ipAddress: "192.168.1.1",
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      }
    ]
  }, 200);
});

sessionsApp.openapi(revokeSessionRoute, async (c) => {
  const { sessionToken } = await c.req.json();
  
  if (!sessionToken) {
    return c.json({ error: { message: "Session token required" } }, 400);
  }
  
  // In a real implementation, you'd call the multi-session revoke API
  return c.json({ success: true }, 200);
});

sessionsApp.openapi(setActiveSessionRoute, async (c) => {
  const { sessionToken } = await c.req.json();
  
  if (!sessionToken) {
    return c.json({ error: { message: "Session token required" } }, 400);
  }
  
  // In a real implementation, you'd call the multi-session set active API
  return c.json({ success: true }, 200);
});

export default sessionsApp;
