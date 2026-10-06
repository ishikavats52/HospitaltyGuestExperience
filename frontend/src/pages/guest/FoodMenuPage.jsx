import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Minus, Check, ShoppingBag } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

export const FoodMenuPage = () => {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const stayId = currentUser?.stay?._id || currentUser?.stayId || (typeof currentUser?.stay === 'string' ? currentUser?.stay : null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        setCategories(res.data.categories);
        setItems(res.data.items);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item._id]: {
        item,
        quantity: (prev[item._id]?.quantity || 0) + 1,
      },
    }));
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[itemId]?.quantity > 1) {
        copy[itemId].quantity -= 1;
      } else {
        delete copy[itemId];
      }
      return copy;
    });
  };

  const cartTotal = Object.values(cart).reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (Object.keys(cart).length === 0) return;
    setOrdering(true);
    setOrderSuccess(null);
    try {
      const orderItems = Object.values(cart).map(({ item, quantity }) => ({
        menuItemId: item._id,
        name: item.name,
        quantity,
        price: item.price,
      }));

      await api.post('/orders', {
        stayId,
        items: orderItems,
        specialInstructions: 'Delivered to room',
      });

      setOrderSuccess('Your food order has been placed and sent to the culinary kitchen!');
      setCart({});
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>
          Culinary In-Room Dining
        </div>
        <h2 className="title-gold page-title" style={{ fontSize: '1.9rem', margin: '4px 0' }}>
          Artisan Guest Menu
        </h2>
        <p className="page-subtitle">
          Fresh gourmet specialties delivered promptly to your suite.
        </p>
      </div>

      {orderSuccess && (
        <div style={{ padding: '12px 16px', background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(28, 108, 67, 0.25)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {orderSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading gourmet menu...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item) => {
            const inCart = cart[item._id]?.quantity || 0;
            
            // Curated high-res culinary images matched by dish name
            const getDishImage = (name) => {
              if (name?.includes('Paneer')) {
                return 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=300&q=80';
              }
              if (name?.includes('Dal Makhani')) {
                return 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80';
              }
              if (name?.includes('Biryani')) {
                return 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80';
              }
              if (name?.includes('Chai') || name?.includes('Tea')) {
                return 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=300&q=80';
              }
              return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80';
            };

            const dishImg = item.imageUrl || getDishImage(item.name);

            return (
              <div
                key={item._id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                }}
              >
                {/* Dish Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        border: '2px solid #16A34A',
                        background: '#16A34A',
                      }}
                      title="100% Vegetarian"
                    />
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--secondary-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Chef's Special
                    </span>
                  </div>

                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.4 }}>
                    {item.description}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 800, color: 'var(--gold-primary)', fontSize: '1.05rem' }}>
                      ₹{item.price}
                    </div>

                    {inCart === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="btn btn-gold"
                        style={{ padding: '6px 16px', fontSize: '0.8rem', borderRadius: '9999px' }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'var(--gold-soft)',
                          border: '1px solid var(--border-active)',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                        }}
                      >
                        <button
                          onClick={() => removeFromCart(item._id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--gold-dark)' }}>{inCart}</span>
                        <button
                          onClick={() => addToCart(item)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dish Photo Thumbnail */}
                <div style={{ position: 'relative', width: '92px', height: '92px', flexShrink: 0 }}>
                  <img
                    src={dishImg}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Settlement Bar */}
      {Object.keys(cart).length > 0 && (
        <div
          className="glass-panel"
          style={{
            position: 'sticky',
            bottom: 'max(72px, calc(65px + env(safe-area-inset-bottom)))',
            padding: '14px 18px',
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            borderColor: 'var(--border-active)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(45, 35, 25, 0.14)',
            zIndex: 45,
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {Object.keys(cart).length} Items in Cart
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-primary)' }}>
              ₹{cartTotal}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={ordering}
            className="btn btn-gold"
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
          >
            <ShoppingBag size={16} /> {ordering ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
};
