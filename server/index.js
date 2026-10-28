import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from './db.js'
import './seed.js'

const app = express()
app.use(cors())
app.use(express.json())
const secret = process.env.JWT_SECRET || 'development-secret-change-me'
const sign = (user) => jwt.sign({ id: user.id, role: user.role, email: user.email }, secret, { expiresIn: '7d' })
const auth = (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    req.user = jwt.verify(token, secret); next()
  } catch { return res.status(401).json({ error: 'Invalid or expired session' }) }
}
const admin = (req, res, next) => req.user.role === 'admin' ? next() : res.status(403).json({ error: 'Admin access required' })

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.get('/api/products', (req, res) => {
  const { category, search, sort = 'featured' } = req.query
  let products = db.prepare(`SELECT * FROM products WHERE (? = '' OR category = ?) AND (lower(name) LIKE lower(?) OR lower(description) LIKE lower(?))`).all(category || '', category || '', `%${search || ''}%`, `%${search || ''}%`)
  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') products.sort((a, b) => b.price - a.price)
  if (sort === 'rating') products.sort((a, b) => b.rating - a.rating)
  res.json(products)
})
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email, and an 8-character password are required' })
  try {
    const result = db.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)').run(name.trim(), email.trim().toLowerCase(), bcrypt.hashSync(password, 10))
    const user = db.prepare('SELECT id,name,email,role FROM users WHERE id=?').get(result.lastInsertRowid)
    res.status(201).json({ user, token: sign(user) })
  } catch { res.status(409).json({ error: 'An account with that email already exists' }) }
})
app.post('/api/auth/login', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE email=?').get((req.body.email || '').trim().toLowerCase())
  if (!user || !bcrypt.compareSync(req.body.password || '', user.password_hash)) return res.status(401).json({ error: 'Email or password is incorrect' })
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: sign(user) })
})
app.use('/api/cart', auth)
app.get('/api/cart', (req, res) => res.json(db.prepare('SELECT p.*, ci.quantity FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.user_id=?').all(req.user.id)))
app.post('/api/cart', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(req.body.productId)
  const quantity = Number(req.body.quantity || 1)
  if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) return res.status(400).json({ error: 'Requested quantity is not available' })
  db.prepare('INSERT INTO cart_items(user_id,product_id,quantity) VALUES(?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=excluded.quantity').run(req.user.id, product.id, quantity)
  res.status(201).json({ ok: true })
})
app.delete('/api/cart/:productId', (req, res) => { db.prepare('DELETE FROM cart_items WHERE user_id=? AND product_id=?').run(req.user.id, req.params.productId); res.status(204).end() })
app.post('/api/orders', auth, (req, res) => {
  const items = db.prepare('SELECT p.*, ci.quantity FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.user_id=?').all(req.user.id)
  if (!items.length) return res.status(400).json({ error: 'Your cart is empty' })
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  let discount = 0
  if (req.body.coupon) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code=? AND active=1 AND expires_at >= date("now")').get(req.body.coupon.trim().toUpperCase())
    if (!coupon) return res.status(400).json({ error: 'Coupon is invalid or expired' })
    if (subtotal < coupon.minimum_order) return res.status(400).json({ error: `Add $${(coupon.minimum_order - subtotal).toFixed(2)} to use this coupon` })
    discount = coupon.kind === 'percent' ? subtotal * coupon.value / 100 : coupon.value
  }
  const shipping = subtotal - discount >= 75 ? 0 : 6
  const total = Math.max(0, subtotal - discount + shipping)
  try {
    const orderId = db.transaction(() => {
      for (const item of items) {
        const updated = db.prepare('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?').run(item.quantity, item.id, item.quantity)
        if (updated.changes !== 1) throw new Error(`Insufficient stock for ${item.name}`)
      }
      const order = db.prepare('INSERT INTO orders(user_id,subtotal,discount,shipping,total) VALUES(?,?,?,?,?)').run(req.user.id, subtotal, discount, shipping, total)
      const addItem = db.prepare('INSERT INTO order_items(order_id,product_id,name,price,quantity) VALUES(?,?,?,?,?)')
      items.forEach(item => addItem.run(order.lastInsertRowid, item.id, item.name, item.price, item.quantity))
      db.prepare('DELETE FROM cart_items WHERE user_id=?').run(req.user.id)
      return order.lastInsertRowid
    })()
    res.status(201).json({ id: orderId, subtotal, discount, shipping, total })
  } catch (error) { res.status(409).json({ error: error.message }) }
})
app.get('/api/orders', auth, (req, res) => res.json(db.prepare('SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC').all(req.user.id)))
app.get('/api/admin/inventory', auth, admin, (_req, res) => res.json(db.prepare('SELECT id,name,category,stock,price FROM products ORDER BY stock ASC').all()))
app.get('/api/admin/orders', auth, admin, (_req, res) => res.json(db.prepare('SELECT o.*, u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC').all()))

if (process.env.NODE_ENV !== 'test') app.listen(process.env.PORT || 3001, () => console.log(`Bloom API running on http://localhost:${process.env.PORT || 3001}`))
export default app
