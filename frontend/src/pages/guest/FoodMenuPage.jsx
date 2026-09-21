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
        <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Culinary In-Room Dining
        </div>
        <h2 className="title-gold" style={{ fontSize: '1.4rem' }}>
          Artisan Guest Menu
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Fresh gourmet specialties delivered promptly to your suite.
        </p>
      </div>

      {orderSuccess && (
        <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {orderSuccess}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading menu...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {items.map((item) => {
            const inCart = cart[item._id]?.quantity || 0;
            return (
              <div key={item._id} className="glass-panel" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#fff', marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      {item.description}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--gold-light)', fontSize: '0.95rem' }}>
                      ₹{item.price}
                    </div>
                  </div>

                  <div>
                    {inCart === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <Plus size={14} /> Add
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'rgba(224, 169, 109, 0.15)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <button
                          onClick={() => removeFromCart(item._id)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{inCart}</span>
                        <button
                          onClick={() => addToCart(item)}
                          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
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
            bottom: '75px',
            padding: '16px 20px',
            background: 'rgba(13, 20, 36, 0.98)',
            borderColor: 'var(--gold-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {Object.keys(cart).length} Items in Cart
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gold-light)' }}>
              ₹{cartTotal}
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={ordering}
            className="btn btn-gold"
            style={{ padding: '10px 18px', fontSize: '0.85rem' }}
          >
            <ShoppingBag size={16} /> {ordering ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      )}
    </div>
  );
};
