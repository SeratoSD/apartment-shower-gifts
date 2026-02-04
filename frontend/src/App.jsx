import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '/api/presents';

function App() {
  const [presents, setPresents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buyModal, setBuyModal] = useState(null);
  const [buyerName, setBuyerName] = useState('');
  const [buying, setBuying] = useState(false);
  
  // Admin state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', description: '', price: '', photo: '', url: '' });

  useEffect(() => {
    fetchPresents();
    const savedAdmin = sessionStorage.getItem('adminPassword');
    if (savedAdmin) setIsAdmin(true);
  }, []);

  async function fetchPresents() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch presents');
      const data = await res.json();
      setPresents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy() {
    if (!buyerName.trim()) return;
    setBuying(true);
    try {
      const res = await fetch(`${API_URL}/${buyModal.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerName: buyerName.trim() })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to mark as bought');
      }
      await fetchPresents();
      setBuyModal(null);
      setBuyerName('');
    } catch (err) {
      alert(err.message);
    } finally {
      setBuying(false);
    }
  }

  async function handleAdminLogin() {
    try {
      const res = await fetch(`${API_URL}/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (res.ok) {
        sessionStorage.setItem('adminPassword', adminPassword);
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPassword('');
      } else {
        alert('Invalid password');
      }
    } catch (err) {
      alert('Login failed');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminPassword');
    setIsAdmin(false);
  }

  async function handleAddGift(e) {
    e.preventDefault();
    const password = sessionStorage.getItem('adminPassword');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(newGift)
      });
      if (!res.ok) throw new Error('Failed to add gift');
      await fetchPresents();
      setShowAddForm(false);
      setNewGift({ name: '', description: '', price: '', photo: '', url: '' });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this gift?')) return;
    const password = sessionStorage.getItem('adminPassword');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password }
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchPresents();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div className="app"><div className="loading">Loading gifts...</div></div>;
  if (error) return <div className="app"><div className="error">Error: {error}</div></div>;

  return (
    <div className="app">
      <header className="header">
        <h1>🎁 Apartment Shower</h1>
        <p>Gift Registry</p>
        {isAdmin ? (
          <div className="admin-badge">Admin Mode</div>
        ) : (
          <button className="admin-link" onClick={() => setShowAdminLogin(true)}>Admin</button>
        )}
      </header>

      {isAdmin && (
        <div className="admin-bar">
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>+ Add Gift</button>
          <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      )}

      <div className="presents-grid">
        {presents.map(present => (
          <div key={present.id} className={`present-card ${present.bought ? 'bought' : ''}`}>
            <img src={present.photo} alt={present.name} className="present-image" />
            <div className="present-content">
              <h3 className="present-name">{present.name}</h3>
              <p className="present-description">{present.description}</p>
              <p className="present-price">${present.price.toFixed(2)}</p>
              
              {present.bought ? (
                <div className="bought-badge">✓ Bought by {present.buyerName}</div>
              ) : (
                <div className="present-actions">
                  <button className="btn btn-primary" onClick={() => setBuyModal(present)}>
                    I'll Buy This
                  </button>
                  <a href={present.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    View
                  </a>
                </div>
              )}
              
              {isAdmin && (
                <button className="btn-delete" onClick={() => handleDelete(present.id)}>🗑 Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className="modal-overlay" onClick={() => setBuyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Buying: {buyModal.name}</h2>
            <input
              type="text"
              placeholder="Your name"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setBuyModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBuy} disabled={buying || !buyerName.trim()}>
                {buying ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Admin Login</h2>
            <input
              type="password"
              placeholder="Password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdminLogin(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdminLogin}>Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Gift Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add New Gift</h2>
            <form onSubmit={handleAddGift}>
              <input type="text" placeholder="Gift name *" value={newGift.name} 
                onChange={e => setNewGift({...newGift, name: e.target.value})} required />
              <input type="text" placeholder="Description" value={newGift.description}
                onChange={e => setNewGift({...newGift, description: e.target.value})} />
              <input type="number" step="0.01" placeholder="Price *" value={newGift.price}
                onChange={e => setNewGift({...newGift, price: e.target.value})} required />
              <input type="url" placeholder="Photo URL" value={newGift.photo}
                onChange={e => setNewGift({...newGift, photo: e.target.value})} />
              <input type="url" placeholder="Buy URL" value={newGift.url}
                onChange={e => setNewGift({...newGift, url: e.target.value})} />
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Gift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
