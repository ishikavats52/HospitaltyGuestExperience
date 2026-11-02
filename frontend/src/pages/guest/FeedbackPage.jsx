import React, { useState } from 'react';
import { Star, Heart, CheckCircle2, MessageSquare, ArrowLeft, Hotel, Award } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';

export const FeedbackPage = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    ratingOverall: 5,
    ratingCleanliness: 5,
    ratingFood: 5,
    ratingStaff: 5,
    npsScore: 10,
  });
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleStarClick = (category, value) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const storedUser = JSON.parse(localStorage.getItem('aura_user') || '{}');
      await api.post('/feedback', {
        stayId: storedUser.stayId || undefined,
        guestName: storedUser.name || 'Valued Guest',
        ratingOverall: ratings.ratingOverall,
        ratingCleanliness: ratings.ratingCleanliness,
        ratingFood: ratings.ratingFood,
        ratingStaff: ratings.ratingStaff,
        npsScore: ratings.npsScore,
        comments,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Thank you for your patience!');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (category, currentVal) => (
    <div style={{ display: 'flex', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(category, star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px',
            color: star <= currentVal ? '#E5A93C' : '#E0D6CE',
            transition: 'transform 0.15s ease',
          }}
          aria-label={`${star} stars`}
        >
          <Star size={24} fill={star <= currentVal ? '#E5A93C' : 'transparent'} />
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary, #fbf7f4)',
        padding: '24px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: 'min(96vw, 560px)',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg, 16px)',
          boxShadow: '0 20px 48px rgba(0,0,0,0.08)',
          border: '1px solid var(--border-color)',
          padding: 'clamp(20px, 4vw, 36px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'var(--gold-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)',
              }}
            >
              <Award size={36} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Thank You For Your Review!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Your insights empower our hospitality team to deliver world-class experiences. We look forward to hosting you again!
              </p>
            </div>

            <Link
              to="/guest/welcome"
              className="btn btn-gold"
              style={{ padding: '12px 28px', fontSize: '0.92rem', fontWeight: 700, textDecoration: 'none', marginTop: '8px' }}
            >
              Return to Aura Hospitality
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--gold-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Guest Experience Review
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 6px' }}>
                How Was Your Stay?
              </h1>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                We value your time. Please take 30 seconds to rate your hospitality experience.
              </p>
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'rgba(186, 51, 51, 0.1)', color: '#BA3333', borderRadius: '8px', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}

            {/* Category Star Ratings */}
            <div
              style={{
                background: 'var(--bg-tertiary, #faf7f5)',
                padding: '16px 20px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Overall Experience
                </span>
                {renderStars('ratingOverall', ratings.ratingOverall)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Room Cleanliness & Comfort
                </span>
                {renderStars('ratingCleanliness', ratings.ratingCleanliness)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Food & In-Room Dining
                </span>
                {renderStars('ratingFood', ratings.ratingFood)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Staff Hospitality & Courtesy
                </span>
                {renderStars('ratingStaff', ratings.ratingStaff)}
              </div>
            </div>

            {/* NPS 0-10 */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  How likely are you to recommend us?
                </label>
                <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--gold-dark)' }}>
                  {ratings.npsScore}/10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={ratings.npsScore}
                onChange={(e) => setRatings({ ...ratings, npsScore: Number(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--gold-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span>Unlikely</span>
                <span>Neutral</span>
                <span>Extremely Likely</span>
              </div>
            </div>

            {/* Comments Box */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Your Feedback or Compliments (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="Share any special moments, favorite amenities, or suggestions for our team..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.86rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-gold"
              style={{
                width: '100%',
                padding: '13px',
                fontWeight: 700,
                fontSize: '0.94rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {submitting ? 'Submitting Review...' : 'Submit Guest Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

