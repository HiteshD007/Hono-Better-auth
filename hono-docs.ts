import { defineConfig, runGenerate } from '@rcmade/hono-docs'

export default defineConfig({
  tsConfigPath: './tsconfig.json',
  openApi: {
    openapi: '3.0.0',
    info: { title: 'HONO', version: '1.0.0' },
    servers: [{ url: 'http://localhost:8000' }],
  },
  outputs: {
    openApiJson: './docs/openapi.json',
  },
  apis: [
    {
      name: 'Check Routes',
      apiPrefix: '/api', // This will be prepended to all `api` values below
      appTypePath: 'src/routes/test.routes.ts', 

      api: [
        {
          api: '/', // Final route = /
          method: 'get',
          summary: 'Check is base routes working',
          description:
            'Returns a text Hello Hono!',
          tag: ['test'],
        },
        {
          api: '/health', // Final route = /auth/
          method: 'get',
          summary: 'Check Server Health',
          description:
            "Return Health of Server",
          tag: ['health'],
        },
      ],
    },
  ],
});


(async () => {
  const cfgPath = './hono-docs.ts'
  await runGenerate(cfgPath);
})();