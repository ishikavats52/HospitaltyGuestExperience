import React, { useState } from 'react';
import { QrCode, CheckCircle2, AlertCircle, Key, UserCheck } from 'lucide-react';
import api from '../../services/api.js';

export const ReceptionDesk = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [stayIdInput, setStayIdInput] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleValidateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let parsedToken = tokenInput;
      let targetStayId = stayIdInput;

      // Check if input is a JSON payload from QR scanner
      try {
        const payload = JSON.parse(tokenInput);
        if (payload.token) parsedToken = payload.token;
        if (payload.stayId) targetStayId = payload.stayId;
      } catch (_) {
        // Raw token string
      }

      const res = await api.post('/qr/validate', {
        token: parsedToken,
        stayId: targetStayId,
        roomId: roomId || undefined,
      });

      setResult(res.data);
      setTokenInput('');
    } catch (err) {
      setError(err.message || 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Front Office Operations
        </div>
        <h1 className="title-gold" style={{ fontSize: '1.8rem' }}>
          Reception QR Pass Validation & Check-In
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Scan guest digital QR passes or input the token to verify cryptographic credentials and activate in-stay privileges.
        </p>
      </div>

      {error && (
        <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.15)', color: '#F87171', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>
            <CheckCircle2 size={20} /> Check-In Confirmed & Activated!
          </div>
          <div style={{ fontSize: '0.85rem' }}>
            Guest: <strong>{result.guestName}</strong> | Stay Status: <strong>{result.status}</strong>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '24px' }}>
        <form onSubmit={handleValidateQR} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              QR Token or Scanned Pass Payload
            </label>
            <textarea
              className="input-control"
              rows={3}
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder='Paste scanned token or JSON payload {"token": "...", "stayId": "..."}'
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Stay ID (Optional if contained in payload)
            </label>
            <input
              type="text"
              className="input-control"
              value={stayIdInput}
              onChange={(e) => setStayIdInput(e.target.value)}
              placeholder="e.g. 660f..."
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-gold" style={{ padding: '12px' }}>
            <UserCheck size={18} /> {loading ? 'Validating Token...' : 'Verify Pass & Authorize Check-In'}
          </button>
        </form>
      </div>
    </div>
  );
};
