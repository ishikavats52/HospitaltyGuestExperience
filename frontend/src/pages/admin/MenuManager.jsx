import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Check, RefreshCw, Power, DollarSign, CheckCircle2, Trash2, Tag, X } from 'lucide-react';
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

  // Self-Add Category State
  const [isAddingCustomCat, setIsAddingCustomCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);
  const [isManageCatsOpen, setIsManageCatsOpen] = useState(false);

  // Background scroll lock when modal is open
  useEffect(() => {
    if (isAddModalOpen || isManageCatsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAddModalOpen, isManageCatsOpen]);

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

  const handleCreateCategory = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCat(true);
    try {
      const res = await api.post('/menu/categories', { name: newCatName.trim() });
      const created = res.data;
      showToast(`Category "${created.name}" created!`);
      setNewCatName('');
      setIsAddingCustomCat(false);
      await fetchMenu();
      if (created?._id) {
        setCategoryId(created._id);
      }
    } catch (err) {
      alert(err.message || 'Failed to create category');
    } finally {
      setCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"? Dishes in this category will become unassigned.`)) {
      return;
    }
    try {
      await api.delete(`/menu/categories/${catId}`);
      showToast(`Category "${catName}" deleted from database`);
      await fetchMenu();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Are you sure you want to delete dish "${itemName}" from the menu?`)) {
      return;
    }
    try {
      await api.delete(`/menu/items/${itemId}`);
      showToast(`Dish "${itemName}" deleted from database`);
      await fetchMenu();
    } catch (err) {
      alert(err.message || 'Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (item) => {
    setUpdatingId(item._id);
    try {
      const nextAvailable = item.isAvailable === false ? true : false;
      await api.patch(`/menu/items/${item._id}`, { isAvailable: nextAvailable });
      showToast(`${item.name} is now ${nextAvailable ? 'In Stock (Available)' : 'Marked Sold Out (Unavailable)'}`);
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
        categoryId: categoryId || (categories[0]?._id),
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

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsManageCatsOpen(true)}
            className="btn btn-outline"
            style={{ padding: '10px 16px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Tag size={15} /> Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingCustomCat(false);
              setIsAddModalOpen(true);
            }}
            className="btn btn-gold"
            style={{ padding: '10px 18px', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} /> Add Menu Item
          </button>
        </div>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          disabled={updatingId === item._id}
                          className={`btn ${item.isAvailable !== false ? 'btn-outline' : 'btn-gold'}`}
                          style={{ padding: '5px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        >
                          <Power size={13} /> {item.isAvailable !== false ? 'Mark Sold Out' : 'Enable Item'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item._id, item.name)}
                          className="btn btn-outline"
                          style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                          title="Delete Dish from Database"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
            className="modal-content has-modal-body glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '520px',
              width: '96%',
              height: '90dvh',
              maxHeight: '92dvh',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Pinned Sticky Header */}
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Add New In-Room Dining Item
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                aria-label="Close modal"
              >
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>✕</span>
              </button>
            </div>

            <form id="add-menu-item-form" onSubmit={handleCreateItem} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {/* Scrollable Body */}
              <div className="modal-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        Category *
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCustomCat(!isAddingCustomCat)}
                        style={{ background: 'none', border: 'none', color: 'var(--gold-dark)', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        {isAddingCustomCat ? '✕ Existing' : '+ Self-Add Category'}
                      </button>
                    </div>

                    {isAddingCustomCat ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="e.g. Desserts, Fast Food..."
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          style={{ fontSize: '0.82rem', flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={creatingCat}
                          className="btn btn-gold"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          {creatingCat ? '...' : 'Save'}
                        </button>
                      </div>
                    ) : (
                      <select
                        className="input-control"
                        value={categoryId}
                        onChange={(e) => {
                          if (e.target.value === '__SELF_ADD__') {
                            setIsAddingCustomCat(true);
                          } else {
                            setCategoryId(e.target.value);
                          }
                        }}
                      >
                        {categories.length === 0 && (
                          <option value="">-- No Categories Found --</option>
                        )}
                        {categories.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.name}
                          </option>
                        ))}
                        <option value="__SELF_ADD__">+ Self-Add New Category...</option>
                      </select>
                    )}
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
              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline"
                  style={{ padding: '10px 18px', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="add-menu-item-form"
                  disabled={creating}
                  className="btn btn-gold"
                  style={{ padding: '10px 22px', fontSize: '0.86rem', fontWeight: 700 }}
                >
                  {creating ? 'Saving...' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {isManageCatsOpen && (
        <div className="modal-backdrop active" onClick={() => setIsManageCatsOpen(false)}>
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '96%',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Menu Categories ({categories.length})
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Add custom culinary categories or delete outdated ones.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsManageCatsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Add Row */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input-control"
                placeholder="New category name (e.g. Desserts)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                style={{ fontSize: '0.84rem', flex: 1 }}
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCat}
                className="btn btn-gold"
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 700 }}
              >
                {creatingCat ? 'Adding...' : 'Add'}
              </button>
            </div>

            {/* Category List */}
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categories.map((c) => {
                const count = items.filter((it) => (it.categoryId?._id || it.categoryId) === c._id).length;
                return (
                  <div
                    key={c._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--bg-primary)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{count} dish{count === 1 ? '' : 'es'}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c._id, c.name)}
                      className="btn btn-outline"
                      style={{ padding: '5px 9px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-bg)' }}
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setIsManageCatsOpen(false)}
                className="btn btn-gold"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
