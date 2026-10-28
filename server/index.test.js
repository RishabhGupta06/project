import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import fs from 'node:fs'
process.env.DATABASE_FILE = './data/test.sqlite'
process.env.NODE_ENV = 'test'
fs.rmSync('./data/test.sqlite', { force: true })
const { default: app } = await import('./index.js')
const { db } = await import('./db.js')
beforeAll(async () => { await import('./seed.js') })
afterAll(() => db.close())

describe('Bloom API', () => {
  it('reports a healthy API', async () => expect((await request(app).get('/api/health')).status).toBe(200))
  it('lists seeded products', async () => expect((await request(app).get('/api/products')).body.length).toBe(8))
  it('rejects weak registration passwords', async () => expect((await request(app).post('/api/auth/register').send({ name: 'Test', email: 'test@bloom.store', password: 'short' })).status).toBe(400))
  it('logs in the seeded demo user', async () => expect((await request(app).post('/api/auth/login').send({ email: 'demo@bloom.store', password: 'Bloom123!' })).body.token).toBeTruthy())
  it('protects the cart endpoint', async () => expect((await request(app).get('/api/cart')).status).toBe(401))
})
