import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Check, RefreshCw, Power, DollarSign, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const MenuManager = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isVegetarian, setIsVegetarian] = useState(true);
  const [creating, setCreating] = useState(false);

  // Background scroll lock when modal is open
  useEffect(() => {
    if (isAddModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await api.get('/menu');
      setCategories(res.data.categories || []);
      setItems(res.data.items || []);
      if (res.data.categories?.length > 0 && !categoryId) {
        setCategoryId(res.data.categories[0]._id);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleAvailability = async (item) => {
    setUpdatingId(item._id);
    try {
      const nextAvailable = !item.isAvailable;
      await api.patch(`/menu/items/${item._id}`, { isAvailable: nextAvailable });
      showToast(`${item.name} is now ${nextAvailable ? 'In Stock' : 'Marked Sold Out'}`);
      await fetchMenu();
    } catch (err) {
      alert(err.message || 'Failed to update item availability');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!name || !price) return;
    setCreating(true);
    try {
      await api.post('/menu/items', {
        name,
        categoryId,
        price: Number(price),
        description,
        isVegetarian,
        isAvailable: true,
      });
      showToast(`Dish "${name}" added to in-room dining menu!`);
      setName('');
      setPrice('');
      setDescription('');
      setIsAddModalOpen(false);
      await fetchMenu();
    } catch (err) {
      alert(err.message || 'Failed to create menu item');
    } finally {
      setCreating(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterCategory === 'ALL') return true;
    const catId = item.categoryId?._id || item.categoryId;
    return catId === filterCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--text-primary)',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999,
            fontSize: '0.88rem',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          <CheckCircle2 size={18} color="var(--success)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>
            Culinary Management
          </div>
          <h1 className="title-gold page-title" style={{ fontSize: '2.1rem', margin: '4px 0', letterSpacing: '-0.02em' }}>
            In-Room Dining Menu Builder
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Configure gourmet dishes, prices, vegetarian indicators, and live kitchen availability.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-gold"
          style={{ padding: '10px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      {/* Menu Table */}
      <div className="glass-panel animate-fade-in" style={{ padding: 'clamp(16px, 3vw, 24px)', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Dining Offerings ({filteredItems.length})
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category:</span>
            <select
              className="input-control"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ width: '160px', padding: '6px 10px', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading culinary catalog...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No culinary items found.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dish / Beverage</th>
                  <th>Category</th>
                  <th>Dietary</th>
                  <th>Guest Price (₹)</th>
                  <th>Kitchen Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {item.description}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gold">
                        {item.categoryId?.name || 'Dining'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${item.isVegetarian ? 'badge-free' : 'badge-danger'}`}
                        style={{ fontSize: '0.72rem' }}
                      >
                        {item.isVegetarian ? '🌱 Pure Veg' : '🍖 Non-Veg'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      ₹{item.price}
                    </td>
                    <td>
                      <span className={`badge ${item.isAvailable !== false ? 'badge-free' : 'badge-danger'}`}>
                        {item.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleAvailability(item)}
                        disabled={updatingId === item._id}
                        className={`btn ${item.isAvailable !== false ? 'btn-outline' : 'btn-gold'}`}
                        style={{ padding: '5px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        <Power size={13} /> {item.isAvailable !== false ? 'Mark Sold Out' : 'Enable Item'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop active" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '500px',
              width: '94%',
              padding: 'clamp(20px, 4vw, 32px)',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Add New In-Room Dining Item
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                aria-label="Close modal"
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✕</span>
              </button>
            </div>

            <form onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Item / Dish Name *
                </label>
                <input
                  type="text"
                  className="input-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter dish name..."
                  required
                />
              </div>

              <div className="responsive-form-grid-2">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    className="input-control"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    className="input-control"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Enter price..."
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Description / Ingredients
                </label>
                <textarea
                  className="input-control"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description of the culinary dish..."
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isVegetarian}
                  onChange={(e) => setIsVegetarian(e.target.checked)}
                  style={{ accentColor: 'var(--gold-primary)' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  Vegetarian Dish (Veg indicator)
                </span>
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-gold"
                  style={{ flex: 1 }}
                >
                  {creating ? 'Saving...' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
