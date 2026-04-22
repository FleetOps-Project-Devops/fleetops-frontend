import { useState, useEffect } from 'react'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    fetch('/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Could not fetch products", err))

    if (token) {
      fetch('/cart', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setCart(data))
        .catch(err => console.error("Could not fetch cart", err))
    }
  }, [token])

  const login = async (e) => {
    e.preventDefault()
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('token', data.token)
      setToken(data.token)
    } else {
      alert("Login failed")
    }
  }

  const addToCart = async (productId) => {
    if (!token) return alert("Please login first")
    await fetch('/cart/add', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity: 1 })
    })
    // Refresh cart
    fetch('/cart', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => setCart(data))
  }

  const placeOrder = async () => {
    if (!token) return
    const res = await fetch('/orders/place', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.ok) {
      alert("Order placed successfully!")
      setCart({ items: [] })
    } else {
      const msg = await res.text()
      alert("Order failed: " + msg)
    }
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🛒 CloudCart</h1>
        <div>
          {!token ? (
            <form onSubmit={login} style={{ display: 'flex', gap: '0.5rem' }}>
              <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="submit">Login</button>
            </form>
          ) : (
            <div>
              <span style={{ marginRight: '1rem' }}>Logged In</span>
              <button onClick={() => { localStorage.removeItem('token'); setToken(null); setCart(null); }}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <main style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <section style={{ flex: 2 }}>
          <h2>Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                <h3>{p.name}</h3>
                <p>₹{p.price}</p>
                <button onClick={() => addToCart(p.id)}>Add to Cart</button>
              </div>
            ))}
            {products.length === 0 && <p>No products available (run seed.sql)</p>}
          </div>
        </section>

        <aside style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
          <h2>Cart</h2>
          {cart?.items?.length > 0 ? (
            <div>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {cart.items.map(item => (
                  <li key={item.id} style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Product #{item.productId}</span>
                    <span>x{item.quantity}</span>
                  </li>
                ))}
              </ul>
              <button onClick={placeOrder} style={{ width: '100%', padding: '0.5rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px' }}>
                Place Order
              </button>
            </div>
          ) : (
            <p>Your cart is empty.</p>
          )}
        </aside>
      </main>
    </div>
  )
}

export default App
