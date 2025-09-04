// src/routes/docs.ts
import { Hono } from 'hono'
import { Scalar } from '@scalar/hono-api-reference'
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { swaggerUI } from '@hono/swagger-ui'


  // A basic OpenAPI document
const openApiDoc = {
  openapi: '3.0.0', // This is the required version field
  info: {
    title: 'API Documentation',
    version: '1.0.0',
    description: 'API documentation for your service',
  },
  paths: {
    // Add your API paths here
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
          },
        },
      },
    },
    // Add more endpoints as needed
  },
}


const docsRoutes = new Hono()
  .get(
    '/',
    Scalar({
      url: '/api/docs/open-api',
      theme: 'kepler',
      layout: 'modern',
      defaultHttpClient: { targetKey: 'js', clientKey: 'axios' },
    })
  )
  .get('/open-api', async (c) => {
    const raw = await fs.readFile(
      path.join(process.cwd(), './docs/openapi.json'),
      'utf-8'
    )
    return c.json(JSON.parse(raw))
  })
  .get("/reference", (c) => c.json(openApiDoc))
  .get("/swagger", swaggerUI({ url: "/api/docs" }))
  .get("/scaler", Scalar({ 
    url: "/api/docs/reference",
    theme: "kepler",
    layout: "modern"
  }));


export type AppType = typeof docsRoutes
export default docsRoutes