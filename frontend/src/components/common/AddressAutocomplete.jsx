import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';

/**
 * AddressAutocomplete
 * Real-time map geocoding & location autocomplete powered by OpenStreetMap / Photon.
 * Provides instant worldwide & India address suggestions without requiring third-party API keys.
 */
export const AddressAutocomplete = ({
  value = '',
  onChange = () => {},
  onSelectLocation = () => {},
  placeholder = 'Search address or location...',
  className = 'input-control',
  required = false,
  disabled = false,
}) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal state when parent value changes externally
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Try Photon Geocoder (Fast OSM based geocoder with CORS enabled)
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm.trim())}&limit=6`;
      const response = await fetch(photonUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          const results = data.features.map((f) => {
            const p = f.properties || {};
            const coords = f.geometry?.coordinates || [];
            const lon = coords[0];
            const lat = coords[1];

            const name = p.name || '';
            const street = p.street ? `${p.street}${p.housenumber ? ' ' + p.housenumber : ''}` : '';
            const city = p.city || p.town || p.village || p.county || '';
            const state = p.state || '';
            const country = p.country || 'India';
            const postcode = p.postcode || '';

            // Clean address string
            const primary = name || street || city;
            const secondaryParts = [street !== primary ? street : '', city !== primary ? city : '', state, country].filter(Boolean);
            const secondary = secondaryParts.join(', ');

            return {
              displayName: [primary, secondary].filter(Boolean).join(', '),
              primary,
              secondary,
              address: [primary, street].filter(Boolean).join(', ') || primary,
              city,
              state,
              country,
              postcode,
              lat,
              lon,
            };
          });

          setSuggestions(results);
          setIsOpen(true);
          setIsLoading(false);
          return;
        }
      }

      // 2. Fallback to OpenStreetMap Nominatim
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchTerm.trim()
      )}&addressdetails=1&limit=6`;
      const nomRes = await fetch(nominatimUrl, {
        headers: { Accept: 'application/json' },
      });
      if (nomRes.ok) {
        const nomData = await nomRes.json();
        const results = nomData.map((item) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || '';
          const state = addr.state || '';
          const country = addr.country || 'India';
          const postcode = addr.postcode || '';
          const primary = item.name || addr.road || city;

          return {
            displayName: item.display_name,
            primary,
            secondary: [addr.road, city, state, country].filter(Boolean).join(', '),
            address: [primary, addr.road].filter(Boolean).join(', ') || primary,
            city,
            state,
            country,
            postcode,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
          };
        });

        setSuggestions(results);
        setIsOpen(results.length > 0);
      }
    } catch (err) {
      console.warn('Address autocomplete geocode error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange(e);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 320);
  };

  const handleSelect = (item) => {
    setQuery(item.displayName);
    setIsOpen(false);
    setSuggestions([]);

    // Bubble up selected location details to parent
    onSelectLocation(item);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    onSelectLocation({
      displayName: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postcode: '',
    });
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className={className}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          style={{ paddingRight: query ? '56px' : '36px' }}
        />

        <div
          style={{
            position: 'absolute',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ color: 'var(--gold-primary)' }} />
          ) : (
            <MapPin size={16} style={{ color: 'var(--gold-primary)' }} />
          )}
        </div>

        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '28px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Clear location"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-active)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1050,
            maxHeight: '260px',
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          <div
            style={{
              padding: '6px 12px',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--gold-dark)',
              background: 'var(--gold-soft)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Navigation size={11} /> Suggested Map Locations (OpenStreetMap)
          </div>

          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(item)}
              style={{
                padding: '9px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gold-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <MapPin size={15} style={{ color: 'var(--gold-primary)', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                  {item.primary}
                </div>
                {item.secondary && (
                  <div
                    style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.2,
                      marginTop: '2px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.secondary}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

