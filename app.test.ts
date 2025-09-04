import { app } from './src/server'
import {test, expect} from 'vitest'

test('GET /', async () => {
  const res = await app.request('/')
  const text = await res.text();
  console.log(text);
  expect(res.status).toBe(200);
  expect(text).toBe('Hello Hono!')
})




