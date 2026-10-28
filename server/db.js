import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const databaseFile = process.env.DATABASE_FILE || './data/bloom.sqlite'
fs.mkdirSync(path.dirname(databaseFile), { recursive: true })
export const db = new Database(databaseFile)
db.pragma('foreign_keys = ON')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'customer', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price REAL NOT NULL CHECK(price >= 0),
    description TEXT NOT NULL, image TEXT NOT NULL, stock INTEGER NOT NULL CHECK(stock >= 0), rating REAL NOT NULL DEFAULT 0,
    reviews INTEGER NOT NULL DEFAULT 0, tag TEXT DEFAULT '', color TEXT DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS carts (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE);
  CREATE TABLE IF NOT EXISTS cart_items (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK(quantity > 0), PRIMARY KEY(user_id, product_id)
  );
  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('percent','fixed')), value REAL NOT NULL,
    minimum_order REAL NOT NULL DEFAULT 0, expires_at TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL REFERENCES users(id), subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0, shipping REAL NOT NULL DEFAULT 0, total REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Processing',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS order_items (
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER NOT NULL,
    name TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL
  );
`)
