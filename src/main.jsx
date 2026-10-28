import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowRight, Check, ChevronDown, ChevronLeft, ChevronRight, CircleUserRound,
  Filter, Heart, Leaf, Minus, PackageCheck, Plus, Search, ShoppingBag, SlidersHorizontal,
  Sparkles, Star, Truck, X
} from 'lucide-react'
import './styles.css'

const initialProducts = [
  { id: 1, name: 'Cloud Ribbed Mug', category: 'Kitchen', price: 24, rating: 4.9, reviews: 86, color: 'cream', tag: 'Bestseller', description: 'A soft, tactile mug for slow mornings.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=800&q=85', stock: 18 },
  { id: 2, name: 'Sol Linen Throw', category: 'Home', price: 68, rating: 4.8, reviews: 42, color: 'ochre', tag: 'New', description: 'Lightweight texture for cozy corners.', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=85', stock: 9 },
  { id: 3, name: 'Sculptural Candle', category: 'Home', price: 32, rating: 4.7, reviews: 31, color: 'sage', tag: '', description: 'Hand-poured soy wax with cedarwood notes.', image: 'https://images.unsplash.com/photo-1602607204676-3f0e2f2c9b8e?auto=format&fit=crop&w=800&q=85', stock: 24 },
  { id: 4, name: 'Daily Ritual Journal', category: 'Stationery', price: 18, rating: 4.9, reviews: 114, color: 'lilac', tag: 'Bestseller', description: 'A quiet place for your brightest ideas.', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=85', stock: 31 },
  { id: 5, name: 'Sunday Market Tote', category: 'Accessories', price: 42, rating: 4.6, reviews: 27, color: 'blue', tag: '', description: 'Roomy, sturdy, and ready for the weekend.', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=85', stock: 14 },
  { id: 6, name: 'Moss Glass Tumbler', category: 'Kitchen', price: 26, rating: 4.8, reviews: 63, color: 'green', tag: 'New', description: 'A reusable glass for every kind of sip.', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85', stock: 20 },
  { id: 7, name: 'Woven Catchall Tray', category: 'Home', price: 36, rating: 4.5, reviews: 18, color: 'terracotta', tag: '', description: 'A little home for keys, rings, and rituals.', image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=85', stock: 12 },
  { id: 8, name: 'Botanical Desk Notes', category: 'Stationery', price: 14, rating: 4.7, reviews: 39, color: 'yellow', tag: '', description: 'Bright little notes for big little thoughts.', image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=85', stock: 45 },
]

const categories = ['All products', 'Home', 'Kitchen', 'Stationery', 'Accessories']
const money = (value) => `$${value.toFixed(2)}`
const API = 'http://localhost:3001/api'

function App() {
  const [products, setProducts] = useState(initialProducts)
  const [activeCategory, setActiveCategory] = useState('All products')
  const [sort, setSort] = useState('Featured')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [view, setView] = useState('shop')
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [toast, setToast] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('bloom-user') || 'null'))
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    fetch(`${API}/products`).then((response) => response.ok ? response.json() : []).then((items) => items.length && setProducts(items)).catch(() => {})
  }, [])
  useEffect(() => {
    if (!user?.token) return
    fetch(`${API}/cart`, { headers: { Authorization: `Bearer ${user.token}` } }).then((response) => response.ok ? response.json() : []).then(setCart).catch(() => {})
  }, [user])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesCategory = activeCategory === 'All products' || product.category === activeCategory
      const matchesQuery = `${product.name} ${product.description}`.toLowerCase().includes(query.toLowerCase())
      return matchesCategory && matchesQuery
    })
    if (sort === 'Price: low to high') return result.sort((a, b) => a.price - b.price)
    if (sort === 'Price: high to low') return result.sort((a, b) => b.price - a.price)
    if (sort === 'Top rated') return result.sort((a, b) => b.rating - a.rating)
    return result
  }, [products, activeCategory, query, sort])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 75 || subtotal === 0 ? 0 : 6
  const total = subtotal + shipping

  const addToCart = (product) => {
    if (product.stock < 1) return
    setCart((current) => {
      const found = current.find((item) => item.id === product.id)
      if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
      return [...current, { ...product, quantity: 1 }]
    })
    setToast(`${product.name} added to your bag`)
    if (user?.token) fetch(`${API}/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ productId: product.id, quantity: (cart.find((item) => item.id === product.id)?.quantity || 0) + 1 }) }).catch(() => {})
  }

  const updateQuantity = (id, delta) => {
    setCart((current) => current.flatMap((item) => {
      if (item.id !== id) return [item]
      const quantity = item.quantity + delta
      return quantity > 0 ? [{ ...item, quantity: Math.min(quantity, item.stock) }] : []
    }))
  }

  const completeOrder = async (event, coupon) => {
    event.preventDefault()
    if (!user?.token) { setCheckoutOpen(false); setLoginOpen(true); setToast('Please sign in before checkout'); return }
    const response = await fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify({ coupon }) })
    if (!response.ok) { const result = await response.json(); setToast(result.error || 'Checkout failed'); return }
    setProducts((current) => current.map((product) => {
      const item = cart.find((entry) => entry.id === product.id)
      return item ? { ...product, stock: product.stock - item.quantity } : product
    }))
    setCart([])
    setCheckoutOpen(false)
    setCartOpen(false)
    setOrderComplete(true)
    setView('shop')
  }

  return (
    <div className="app-shell">
      <div className="announcement"><Sparkles size={14} /> Free shipping on orders over $75 <span>·</span> Thoughtfully made, always.</div>
      <header className="site-header">
        <button className="brand" onClick={() => { setView('shop'); setActiveCategory('All products') }} aria-label="Bloom home">
          <span className="brand-mark">b</span><span>bloom</span>
        </button>
        <nav className="desktop-nav">
          <button className={view === 'shop' && activeCategory === 'All products' ? 'active' : ''} onClick={() => { setView('shop'); setActiveCategory('All products') }}>Shop all</button>
          <button onClick={() => { setView('shop'); setActiveCategory('Home') }}>Home</button>
          <button onClick={() => { setView('shop'); setActiveCategory('Kitchen') }}>Kitchen</button>
          <button onClick={() => { setView('shop'); setActiveCategory('Stationery') }}>Stationery</button>
        </nav>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Search" onClick={() => document.querySelector('.search-input')?.focus()}><Search size={20} /></button>
          <button className="icon-btn profile-btn" aria-label="Account" onClick={() => setLoginOpen(true)}><CircleUserRound size={20} /></button>
          <button className="bag-btn" onClick={() => setCartOpen(true)}><ShoppingBag size={19} /><span>Bag</span>{cartCount > 0 && <b>{cartCount}</b>}</button>
        </div>
      </header>

      {view === 'shop' ? (
        <main>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow">Small joys, made well</span>
              <h1>Make room for<br /><em>the good stuff.</em></h1>
              <p>Thoughtful goods for everyday rituals. Designed to be used, loved, and kept around.</p>
              <button className="primary-btn" onClick={() => document.getElementById('shop-grid').scrollIntoView({ behavior: 'smooth' })}>Explore the collection <ArrowRight size={17} /></button>
              <div className="hero-proof"><div className="avatars"><span>J</span><span>M</span><span>A</span></div><div><strong>Loved by 2,000+ people</strong><small>★★★★★ <i>4.9 average rating</i></small></div></div>
            </div>
            <div className="hero-art"><div className="hero-sun"></div><img src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1100&q=85" alt="Warmly styled home interior" /><span className="art-note">made for<br /><strong>slow living</strong></span></div>
          </section>

          <section className="promise-row">
            <div><Leaf size={21} /><span><strong>Better materials</strong><small>Considered from the start</small></span></div>
            <div><PackageCheck size={21} /><span><strong>Easy, happy returns</strong><small>30 days to change your mind</small></span></div>
            <div><Truck size={21} /><span><strong>Ships with care</strong><small>From our studio to your door</small></span></div>
          </section>

          <section className="catalog" id="shop-grid">
            <div className="section-heading"><div><span className="eyebrow">The collection</span><h2>Find your next favorite.</h2></div><p>Little things that make a<br className="desktop-only" /> big difference.</p></div>
            <div className="catalog-toolbar">
              <div className="category-tabs">{categories.map((category) => <button key={category} className={activeCategory === category ? 'selected' : ''} onClick={() => setActiveCategory(category)}>{category}</button>)}</div>
              <div className="toolbar-right"><button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> Filters</button><label className="sort-select">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Featured</option><option>Top rated</option><option>Price: low to high</option><option>Price: high to low</option></select><ChevronDown size={15} /></label></div>
            </div>
            {showFilters && <div className="filter-panel"><label>Search the collection <div className="search-wrap"><Search size={16} /><input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “mug” or “journal”" /></div></label><span>{filteredProducts.length} of {products.length} pieces</span></div>}
            <div className="product-grid">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={addToCart} />)}</div>
            {filteredProducts.length === 0 && <div className="empty-state"><Search size={34} /><h3>No pieces found</h3><p>Try a different search or category.</p><button className="text-btn" onClick={() => { setQuery(''); setActiveCategory('All products') }}>Clear filters <ArrowRight size={15} /></button></div>}
          </section>
          <section className="story-banner"><div className="story-image"><img src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85" alt="Bloom studio workspace" /></div><div className="story-copy"><span className="eyebrow">Our point of view</span><h2>Good design should<br /><em>feel like home.</em></h2><p>We look for the pieces that make a room feel warmer, a morning feel slower, and an ordinary day feel a little more yours.</p><button className="text-btn">Read our story <ArrowRight size={16} /></button></div></section>
        </main>
      ) : <Admin products={products} onBack={() => setView('shop')} />}

      <footer><div className="footer-brand"><span className="brand-mark">b</span><strong>bloom</strong><p>Thoughtful goods for everyday rituals.</p></div><div><strong>Explore</strong><button>Shop all</button><button>Our story</button></div><div><strong>Help</strong><button>Shipping & returns</button><button>Contact us</button></div><div className="newsletter"><strong>Stay in the know</strong><p>New pieces, thoughtful notes, no noise.</p><div><input placeholder="Your email address" /><button aria-label="Subscribe"><ArrowRight size={17} /></button></div></div></footer>
      <div className="admin-link"><button onClick={() => setView('admin')}>Admin dashboard</button></div>

      {toast && <div className="toast"><Check size={17} /> {toast}</div>}
      {orderComplete && <div className="modal-backdrop"><div className="success-modal"><div className="success-icon"><Check size={30} /></div><span className="eyebrow">Order confirmed</span><h2>Thank you for choosing good.</h2><p>Your order is on its way to becoming part of your everyday. We’ll send tracking details to your inbox soon.</p><button className="primary-btn" onClick={() => setOrderComplete(false)}>Continue shopping <ArrowRight size={17} /></button></div></div>}
      {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} shipping={shipping} total={total} onClose={() => setCartOpen(false)} onUpdate={updateQuantity} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }} />}
      {checkoutOpen && <Checkout total={total} onClose={() => setCheckoutOpen(false)} onSubmit={completeOrder} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onLogin={(result) => { setUser(result); localStorage.setItem('bloom-user', JSON.stringify(result)); setLoginOpen(false); setToast(`Welcome back, ${result.user.name}`) }} />}
    </div>
  )
}

function ProductCard({ product, onAdd }) {
  return <article className="product-card"><div className="product-image"><img src={product.image} alt={product.name} />{product.tag && <span className="product-tag">{product.tag}</span>}<button className="heart-btn" aria-label={`Save ${product.name}`}><Heart size={17} /></button><div className="quick-add"><button onClick={() => onAdd(product)} disabled={product.stock === 0}>{product.stock === 0 ? 'Sold out' : 'Add to bag'} <Plus size={15} /></button></div></div><div className="product-info"><div><h3>{product.name}</h3><span>{product.description}</span></div><strong>{money(product.price)}</strong></div><div className="rating"><Star size={13} fill="currentColor" /> {product.rating} <span>({product.reviews})</span><small>{product.stock < 5 ? `Only ${product.stock} left` : ''}</small></div></article>
}

function CartDrawer({ cart, subtotal, shipping, total, onClose, onUpdate, onCheckout }) {
  return <div className="drawer-layer"><div className="drawer-scrim" onClick={onClose}></div><aside className="cart-drawer"><div className="drawer-head"><div><span className="eyebrow">Your selection</span><h2>Your bag <small>({cart.reduce((a, b) => a + b.quantity, 0)})</small></h2></div><button className="close-btn" onClick={onClose}><X size={20} /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={34} /><h3>Your bag is waiting.</h3><p>Add something lovely to get started.</p><button className="primary-btn" onClick={onClose}>Keep browsing <ArrowRight size={16} /></button></div> : <><div className="cart-items">{cart.map((item) => <div className="cart-item" key={item.id}><img src={item.image} alt="" /><div className="cart-item-copy"><strong>{item.name}</strong><span>{money(item.price)}</span><div className="quantity"><button onClick={() => onUpdate(item.id, -1)}><Minus size={13} /></button><b>{item.quantity}</b><button onClick={() => onUpdate(item.id, 1)}><Plus size={13} /></button></div></div><strong>{money(item.price * item.quantity)}</strong></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Shipping</span><b>{shipping === 0 ? 'Free' : money(shipping)}</b></div>{shipping > 0 && <p>Add {money(75 - subtotal)} more for free shipping</p>}<div className="total-line"><span>Total</span><b>{money(total)}</b></div><button className="primary-btn full" onClick={onCheckout}>Checkout <ArrowRight size={17} /></button><small className="secure-note">Secure checkout · Free returns within 30 days</small></div></>}</aside></div>
}

function Checkout({ total, onClose, onSubmit }) {
  return <div className="modal-backdrop"><div className="checkout-modal"><div className="modal-head"><div><span className="eyebrow">Almost there</span><h2>Complete your order</h2></div><button className="close-btn" onClick={onClose}><X size={20} /></button></div><form onSubmit={(event) => onSubmit(event, event.currentTarget.coupon.value)}><label>Email address<input type="email" placeholder="you@example.com" required /></label><div className="form-row"><label>First name<input required placeholder="Alex" /></label><label>Last name<input required placeholder="Morgan" /></label></div><label>Shipping address<input required placeholder="123 Bloom Street" /></label><div className="form-row"><label>City<input required placeholder="New York" /></label><label>ZIP code<input required pattern="[0-9]{5}" placeholder="10001" /></label></div><label>Coupon code (optional)<input name="coupon" placeholder="Try BLOOM10" /></label><div className="payment-title"><span>Payment</span><small>Demo checkout — no payment is charged</small></div><label className="card-field">Card number<input required pattern="[0-9 ]{12,19}" placeholder="4242 4242 4242 4242" /></label><button className="primary-btn full" type="submit">Place order · {money(total)} <ArrowRight size={17} /></button></form></div></div>
}

function LoginModal({ onClose, onLogin }) {
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const response = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) })
    const result = await response.json()
    if (!response.ok) return setError(result.error)
    onLogin(result)
  }
  return <div className="modal-backdrop"><div className="checkout-modal"><div className="modal-head"><div><span className="eyebrow">Welcome back</span><h2>Sign in to Bloom</h2></div><button className="close-btn" onClick={onClose}><X size={20} /></button></div><form onSubmit={submit}><label>Email address<input name="email" type="email" required placeholder="demo@bloom.store" /></label><label>Password<input name="password" type="password" required placeholder="Bloom123!" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-btn full" type="submit">Sign in <ArrowRight size={17} /></button><small className="secure-note">Demo account: demo@bloom.store / Bloom123!</small></form></div></div>
}

function Admin({ products, onBack }) {
  const lowStock = products.filter((product) => product.stock < 10)
  return <main className="admin-page"><div className="admin-top"><div><span className="eyebrow">Bloom workspace</span><h1>Good morning, Alex.</h1><p>Here’s what’s happening with your store today.</p></div><button className="secondary-btn" onClick={onBack}><ChevronLeft size={16} /> Back to store</button></div><div className="stats-grid"><div><span>Total revenue</span><strong>$12,486.00</strong><small className="positive">↑ 12.8% from last month</small></div><div><span>Orders</span><strong>248</strong><small className="positive">↑ 8.2% from last month</small></div><div><span>Products</span><strong>{products.length}</strong><small>Across 4 categories</small></div><div><span>Low stock</span><strong>{lowStock.length}</strong><small className="warning">Needs your attention</small></div></div><div className="admin-columns"><section className="admin-panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Your latest customer activity</p></div><button className="text-btn">View all <ArrowRight size={15} /></button></div><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead><tbody><tr><td>#BL-1048</td><td>Olivia Martin</td><td>Oct 28, 2026</td><td>$86.00</td><td><span className="status shipped">Shipped</span></td></tr><tr><td>#BL-1047</td><td>James Wilson</td><td>Oct 28, 2026</td><td>$42.00</td><td><span className="status processing">Processing</span></td></tr><tr><td>#BL-1046</td><td>Sophia Chen</td><td>Oct 27, 2026</td><td>$118.00</td><td><span className="status delivered">Delivered</span></td></tr><tr><td>#BL-1045</td><td>Noah Williams</td><td>Oct 27, 2026</td><td>$24.00</td><td><span className="status delivered">Delivered</span></td></tr></tbody></table></section><section className="admin-panel inventory"><div className="panel-heading"><div><h2>Inventory health</h2><p>Keep your bestsellers in stock</p></div><button className="text-btn">Manage <ArrowRight size={15} /></button></div>{products.slice(0, 5).map((product) => <div className="inventory-item" key={product.id}><img src={product.image} alt="" /><div><strong>{product.name}</strong><span>{product.category}</span></div><div className="stock-bar"><i style={{ width: `${Math.min(product.stock / 35 * 100, 100)}%` }}></i></div><b className={product.stock < 10 ? 'stock-low' : ''}>{product.stock} left</b></div>)}</section></div></main>
}

createRoot(document.getElementById('root')).render(<App />)
