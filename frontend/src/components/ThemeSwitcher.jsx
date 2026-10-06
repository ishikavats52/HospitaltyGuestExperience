import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useHospitalityTheme } from '../context/ThemeContext.jsx';

export const ThemeSwitcher = ({ compact = false }) => {
  const { currentTheme, selectTheme, themes, activeThemeMeta } = useHospitalityTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', zIndex: 100 }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: compact ? '5px 10px' : '7px 13px',
          borderRadius: '9999px',
          cursor: 'pointer',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-active)',
          boxShadow: 'var(--shadow-xs)',
          fontSize: '0.78rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          transition: 'all 0.2s ease',
        }}
        title="Change Hospitality Theme"
      >
        <span
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: activeThemeMeta.primary,
            display: 'inline-block',
            boxShadow: `0 0 6px ${activeThemeMeta.primary}`,
          }}
        />
        <Palette size={13} color="var(--gold-primary)" />
        <span style={{ letterSpacing: '0.02em' }}>{activeThemeMeta.badge}</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="glass-panel animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '270px',
            padding: '12px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 18px 45px -10px rgba(0, 0, 0, 0.18), 0 4px 14px rgba(0, 0, 0, 0.06)',
            border: '1px solid var(--border-active)',
            zIndex: 110,
          }}
        >
          <div
            style={{
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
              color: 'var(--text-muted)',
              marginBottom: '8px',
              paddingLeft: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Hospitality Theme</span>
            <Sparkles size={12} color="var(--gold-primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {themes.map((th) => {
              const isSelected = th.id === currentTheme;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    selectTheme(th.id);
                    setIsOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: isSelected ? `1px solid ${th.primary}` : '1px solid transparent',
                    background: isSelected ? 'var(--gold-soft)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    width: '100%',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Color Swatch Dots */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: th.primary,
                          display: 'inline-block',
                          border: '2px solid #FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          zIndex: 2,
                        }}
                      />
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: th.secondary,
                          display: 'inline-block',
                          marginLeft: '-6px',
                          border: '2px solid #FFFFFF',
                          zIndex: 1,
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {th.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {th.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check size={15} color={th.primary} strokeWidth={2.6} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
