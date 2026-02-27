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
  const [showGiftForm, setShowGiftForm] = useState(false);
  const [editingGift, setEditingGift] = useState(null);
  const [giftForm, setGiftForm] = useState({ name: '', description: '', price: '', photo: '', url: '' });
  const [siteHidden, setSiteHidden] = useState(false);
  const [siteVisible, setSiteVisible] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  useEffect(() => {
    fetchPresents();
    const savedAdmin = sessionStorage.getItem('adminPassword');
    if (savedAdmin) {
      setIsAdmin(true);
      fetchVisibility();
    }
  }, []);

  async function fetchPresents() {
    try {
      const password = sessionStorage.getItem('adminPassword');
      const headers = password ? { 'x-admin-password': password } : {};
      const res = await fetch(API_URL, { headers });
      if (!res.ok) throw new Error('Failed to fetch presents');
      const data = await res.json();
      
      if (data.hidden) {
        setSiteHidden(true);
        setPresents([]);
      } else {
        setSiteHidden(false);
        setPresents(data.presents);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchVisibility() {
    const password = sessionStorage.getItem('adminPassword');
    if (!password) return;
    try {
      const res = await fetch(`${API_URL}/admin/visibility`, {
        headers: { 'x-admin-password': password }
      });
      if (res.ok) {
        const data = await res.json();
        setSiteVisible(data.visible);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleVisibility() {
    const password = sessionStorage.getItem('adminPassword');
    try {
      const res = await fetch(`${API_URL}/admin/visibility`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password 
        },
        body: JSON.stringify({ visible: !siteVisible })
      });
      if (res.ok) {
        setSiteVisible(!siteVisible);
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleBuy() {
    if (!buyerName.trim()) return;
    setBuying(true);
    try {
      const res = await fetch(`${API_URL}/${buyModal._id}/buy`, {
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
        fetchPresents();
        fetchVisibility();
      } else {
        alert('Contraseña incorrecta');
      }
    } catch (err) {
      alert('Error al iniciar sesión');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminPassword');
    setIsAdmin(false);
    fetchPresents();
  }

  function openAddForm() {
    setEditingGift(null);
    setGiftForm({ name: '', description: '', price: '', photo: '', url: '' });
    setShowGiftForm(true);
  }

  function openEditForm(present) {
    setEditingGift(present);
    setGiftForm({
      name: present.name,
      description: present.description || '',
      price: String(present.price),
      photo: present.photo || '',
      url: present.url || ''
    });
    setShowGiftForm(true);
  }

  async function handleSubmitGift(e) {
    e.preventDefault();
    const password = sessionStorage.getItem('adminPassword');
    const isEditing = !!editingGift;
    
    try {
      const res = await fetch(isEditing ? `${API_URL}/${editingGift._id}` : API_URL, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password
        },
        body: JSON.stringify(giftForm)
      });
      if (!res.ok) throw new Error(`Failed to ${isEditing ? 'update' : 'add'} gift`);
      await fetchPresents();
      setShowGiftForm(false);
      setEditingGift(null);
      setGiftForm({ name: '', description: '', price: '', photo: '', url: '' });
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este regalo?')) return;
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

  async function handleRelease(id) {
    if (!confirm('¿Liberar este regalo?')) return;
    const password = sessionStorage.getItem('adminPassword');
    try {
      const res = await fetch(`${API_URL}/${id}/release`, {
        method: 'POST',
        headers: { 'x-admin-password': password }
      });
      if (!res.ok) throw new Error('Failed to release');
      await fetchPresents();
    } catch (err) {
      alert(err.message);
    }
  }

  function getFilteredPresents() {
    let filtered = [...presents];
    
    if (showOnlyAvailable) {
      filtered = filtered.filter(p => !p.bought);
    }
    
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    
    return filtered;
  }

  if (loading) return <div className="app"><div className="loading">Cargando regalos...</div></div>;
  if (error) return <div className="app"><div className="error">Error: {error}</div></div>;
  
  if (siteHidden && !isAdmin) {
    return (
      <div className="app">
        <header className="header">
          <h1>🎁 Apartment Shower</h1>
          <p>Lista de Regalos</p>
          <button className="admin-link" onClick={() => setShowAdminLogin(true)}>Admin</button>
        </header>
        <div className="hidden-message">
          <span>🚧</span>
          <p>Estamos preparando algo especial para ti. ¡Vuelve pronto!</p>
        </div>
        
        {showAdminLogin && (
          <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2>Acceso Admin</h2>
              <input
                type="password"
                placeholder="Contraseña"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowAdminLogin(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAdminLogin}>Entrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🎁 Apartment Shower</h1>
        <p>Lista de Regalos</p>
        {isAdmin ? (
          <div className="admin-badge">Modo Admin</div>
        ) : (
          <button className="admin-link" onClick={() => setShowAdminLogin(true)}>Admin</button>
        )}
      </header>

      <p className="welcome-text">
        <span className="welcome-highlight">Hey!</span> Si estás aquí es porque te queremos mucho y queremos que seas parte de nuestra nueva casita. 
        Abajo encontrarás algunos presents que nos harán muy felices y que usaremos todos los días en nuestro nuevo hogar. 
        Echa un ojito, siéntete como en casa y escoge el que prefieras (no es obligatorio, lo importante es tu presencia, te esperamos para celebrar!). <span className="welcome-highlight">Recuerda marcar como comprado</span> el ítem que elegiste (así los demás lo sabrán).
        Gracias por tomarte el tiempo de estar aquí, <span className="welcome-highlight">nos vemos el 28 de Marzo!</span> :)
      </p>

      {isAdmin && (
        <div className="admin-bar">
          <button className="btn btn-primary" onClick={openAddForm}>+ Agregar Regalo</button>
          <button 
            className={`btn ${siteVisible ? 'btn-secondary' : 'btn-warning'}`} 
            onClick={toggleVisibility}
          >
            {siteVisible ? '👁 Ocultar Sitio' : '👁‍🗨 Mostrar Sitio'}
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>Salir</button>
        </div>
      )}

      {!isAdmin && (
        <div className="filter-bar">
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
            <option value="default">Ordenar por</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>
          <label className="filter-checkbox">
            <input 
              type="checkbox" 
              checked={showOnlyAvailable} 
              onChange={e => setShowOnlyAvailable(e.target.checked)} 
            />
            Solo disponibles
          </label>
        </div>
      )}

      <div className="presents-grid">
        {getFilteredPresents().map(present => (
          <div key={present._id} className={`present-card ${present.bought ? 'bought' : ''}`}>
            <img src={present.photo} alt={present.name} className="present-image" />
            <div className="present-content">
              <h3 className="present-name">{present.name}</h3>
              <p className="present-description">{present.description}</p>
              <p className="present-price">${present.price.toFixed(2)}</p>
              
              {present.bought ? (
                <div className="bought-badge">
                  ✓ Comprado por {present.buyerName}
                  {isAdmin && (
                    <button className="btn-release" onClick={() => handleRelease(present._id)}>Liberar</button>
                  )}
                </div>
              ) : (
                <div className="present-actions">
                  {!isAdmin && (
                    <button className="btn btn-primary" onClick={() => setBuyModal(present)}>
                      Lo Compro!
                    </button>
                  )}
                  <a href={present.url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Ver
                  </a>
                </div>
              )}
              
              {isAdmin && (
                <div className="admin-actions">
                  <button className="btn-edit" onClick={() => openEditForm(present)}>✏️ Editar</button>
                  <button className="btn-delete" onClick={() => handleDelete(present._id)}>🗑 Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Buy Modal */}
      {buyModal && (
        <div className="modal-overlay" onClick={() => setBuyModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Comprando: {buyModal.name}</h2>
            <input
              type="text"
              placeholder="Tu nombre"
              value={buyerName}
              onChange={e => setBuyerName(e.target.value)}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setBuyModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleBuy} disabled={buying || !buyerName.trim()}>
                {buying ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Acceso Admin</h2>
            <input
              type="password"
              placeholder="Contraseña"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAdminLogin(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleAdminLogin}>Entrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Gift Modal */}
      {showGiftForm && (
        <div className="modal-overlay" onClick={() => setShowGiftForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editingGift ? 'Editar Regalo' : 'Agregar Nuevo Regalo'}</h2>
            <form onSubmit={handleSubmitGift}>
              <input type="text" placeholder="Nombre del regalo *" value={giftForm.name} 
                onChange={e => setGiftForm({...giftForm, name: e.target.value})} required />
              <input type="text" placeholder="Descripción" value={giftForm.description}
                onChange={e => setGiftForm({...giftForm, description: e.target.value})} />
              <input type="number" step="0.01" placeholder="Precio *" value={giftForm.price}
                onChange={e => setGiftForm({...giftForm, price: e.target.value})} required />
              <input type="url" placeholder="URL de la foto" value={giftForm.photo}
                onChange={e => setGiftForm({...giftForm, photo: e.target.value})} />
              <input type="url" placeholder="URL para comprar" value={giftForm.url}
                onChange={e => setGiftForm({...giftForm, url: e.target.value})} />
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowGiftForm(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingGift ? 'Guardar Cambios' : 'Agregar Regalo'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
