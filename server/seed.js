import bcrypt from 'bcryptjs'
import { db } from './db.js'

const products = [
  [1,'Cloud Ribbed Mug','Kitchen',24,'A soft, tactile mug for slow mornings.','https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85',18,4.9,86,'Bestseller','cream'],
  [2,'Sol Linen Throw','Home',68,'Lightweight texture for cozy corners.','https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85',9,4.8,42,'New','ochre'],
  [3,'Sculptural Candle','Home',32,'Hand-poured soy wax with cedarwood notes.','https://images.unsplash.com/photo-1602607204676-3f0e2f2c9b8e?auto=format&fit=crop&w=800&q=85',24,4.7,31,'','sage'],
  [4,'Daily Ritual Journal','Stationery',18,'A quiet place for your brightest ideas.','https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85',31,4.9,114,'Bestseller','lilac'],
  [5,'Sunday Market Tote','Accessories',42,'Roomy, sturdy, and ready for the weekend.','https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=85',14,4.6,27,'','blue'],
  [6,'Moss Glass Tumbler','Kitchen',26,'A reusable glass for every kind of sip.','https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85',20,4.8,63,'New','green'],
  [7,'Woven Catchall Tray','Home',36,'A little home for keys, rings, and rituals.','https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=85',12,4.5,18,'','terracotta'],
  [8,'Botanical Desk Notes','Stationery',14,'Bright little notes for big little thoughts.','https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=85',45,4.7,39,'','yellow'],
]
const insert = db.prepare('INSERT OR IGNORE INTO products (id,name,category,price,description,image,stock,rating,reviews,tag,color) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
const seed = db.transaction(() => {
  for (const product of products) insert.run(...product)
  db.prepare('INSERT OR IGNORE INTO coupons (code,kind,value,minimum_order,expires_at) VALUES (?,?,?,?,?)').run('BLOOM10','percent',10,40,'2027-12-31')
  db.prepare('INSERT OR IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)').run('Demo Customer','demo@bloom.store',bcrypt.hashSync('Bloom123!', 10),'customer')
  db.prepare('INSERT OR IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)').run('Alex Admin','admin@bloom.store',bcrypt.hashSync('Admin123!', 10),'admin')
})
seed()
console.log('Bloom database seeded. Demo login: demo@bloom.store / Bloom123!')
