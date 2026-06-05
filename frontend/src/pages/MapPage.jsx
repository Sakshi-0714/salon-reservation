import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import Navbar from '../components/Navbar';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const salonLocation = L.latLng(15.8368, 74.5093); // Tilakwadi, Belgaum, India
const indiaBounds = [
  [6.4627, 68.1097], // South West
  [35.5133, 97.3954] // North East
];

// Custom component to inject OSRM Route Control into React-Leaflet
const RoutingControl = ({ startLocation, onRouteError, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!startLocation) return;

    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (e) { /* ignore cleanup errors */ }
      routingControlRef.current = null;
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(startLocation.lat, startLocation.lng),
        salonLocation
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'driving',
        timeout: 30000,
      }),
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      addWaypoints: false,
      show: true,
      lineOptions: {
        styles: [{ color: '#ffa396', weight: 5, opacity: 0.8 }]
      },
    }).addTo(map);

    control.on('routesfound', (e) => {
      const routes = e.routes;
      if (routes && routes.length > 0 && onRouteFound) {
        const summary = routes[0].summary;
        const distKm = (summary.totalDistance / 1000).toFixed(1);
        const timeMin = Math.round(summary.totalTime / 60);
        onRouteFound(`Route found! ${distKm} km — approx. ${timeMin} min drive`);
      }
    });

    control.on('routingerror', (e) => {
      console.error('Routing error:', e.error);
      if (onRouteError) {
        onRouteError('Could not calculate route. The routing service may be temporarily unavailable. Please try again.');
      }
    });

    routingControlRef.current = control;

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          // Ignore cleanup errors
        }
        routingControlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, startLocation]);

  return null;
};

const MapPage = () => {
  const [address, setAddress] = useState('');
  const [startLocation, setStartLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeout = useRef(null);
  const suggestionsRef = useRef(null);

  // Memoize callbacks to prevent infinite re-renders in RoutingControl
  const handleRouteError = useCallback((msg) => {
    setErrorMsg(msg);
    setSuccessMsg('');
  }, []);

  const handleRouteFound = useCallback((msg) => {
    setSuccessMsg(msg);
    setErrorMsg('');
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced address autocomplete
  const handleAddressChange = (e) => {
    const value = e.target.value;
    setAddress(value);

    if (suggestionsTimeout.current) {
      clearTimeout(suggestionsTimeout.current);
    }

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    suggestionsTimeout.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(
          'https://nominatim.openstreetmap.org/search',
          {
            params: {
              format: 'json',
              countrycodes: 'in',
              q: value,
              limit: 5,
              addressdetails: 1,
            },
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'StaySyncSalonApp/1.0 (salon-reservation-app)',
            },
            timeout: 8000,
          }
        );
        setSuggestions(data || []);
        setShowSuggestions(data && data.length > 0);
      } catch (err) {
        // Silently fail for autocomplete — user can still submit manually
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 400);
  };

  const handleSuggestionClick = (suggestion) => {
    setAddress(suggestion.display_name);
    setStartLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    setSuggestions([]);
    setShowSuggestions(false);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleUseCurrentLocation = () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setStartLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg("Location permission denied. Click the lock icon in the address bar, allow Location for this site, then try again. You can also enter your address manually below.");
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg("Location information is unavailable. Please try entering your address manually.");
            break;
          case error.TIMEOUT:
            setErrorMsg("Location request timed out. Please try again.");
            break;
          default:
            setErrorMsg("Unable to retrieve your location. Please check browser permissions.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const handleAddressSearch = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setErrorMsg('Please enter an address to search.');
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setIsSearching(true);
    setShowSuggestions(false);
    
    try {
      const { data } = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            format: 'json',
            countrycodes: 'in',
            q: address,
            limit: 5,
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'StaySyncSalonApp/1.0 (salon-reservation-app)',
          },
          timeout: 10000,
        }
      );
      
      if (data && data.length > 0) {
        setStartLocation({ 
          lat: parseFloat(data[0].lat), 
          lng: parseFloat(data[0].lon) 
        });
      } else {
        setErrorMsg("Address not found. Try being more specific (e.g. include city and state).");
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setErrorMsg("Request timed out. Please check your internet connection and try again.");
      } else if (err.response?.status === 403) {
        setErrorMsg("Geocoding service access denied. Please try again in a moment.");
      } else if (err.response?.status === 429) {
        setErrorMsg("Too many requests. Please wait a few seconds and try again.");
      } else {
        setErrorMsg("Error communicating with geocoding service. Please check your internet connection.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleResetRoute = () => {
    setStartLocation(null);
    setAddress('');
    setErrorMsg('');
    setSuccessMsg('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <>
      <Navbar />
      <div className="map-page-container">
        <div className="map-sidebar card">
          <h2 className="heading-primary" style={{ fontSize: '1.8rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            Find the Salon
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            We are deeply rooted right in Hindwadi opposite to Lokmanya Society. 
          </p>

          <button 
            className="btn-primary" 
            style={{ width: '100%', marginBottom: '1.5rem', position: 'relative' }} 
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <span className="spinner" style={{ marginRight: '8px' }}></span>
                Getting Location...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>📍</span> 
                Use My Current Location
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: '1rem 0', fontWeight: 'bold' }}>OR</div>

          <form onSubmit={handleAddressSearch}>
            <div className="form-group" style={{ position: 'relative' }} ref={suggestionsRef}>
              <label className="form-label">Type your Address Manually</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. MG Road, Bangalore" 
                value={address} 
                onChange={handleAddressChange}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                autoComplete="off"
              />
              {/* Autocomplete dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="autocomplete-dropdown">
                  {suggestions.map((s, idx) => (
                    <div
                      key={idx}
                      className="autocomplete-item"
                      onClick={() => handleSuggestionClick(s)}
                    >
                      <span style={{ marginRight: '8px', fontSize: '1rem' }}>📍</span>
                      <span>{s.display_name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              className="btn-outline" 
              style={{ width: '100%' }} 
              type="submit"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <span className="spinner spinner-dark" style={{ marginRight: '8px' }}></span>
                  Searching...
                </>
              ) : 'Calculate Route'}
            </button>
          </form>

          {/* Reset Route Button */}
          {startLocation && (
            <button 
              className="btn-outline" 
              style={{ width: '100%', marginTop: '1rem', borderColor: '#e74c3c', color: '#e74c3c' }} 
              onClick={handleResetRoute}
            >
              ✕ Reset Route
            </button>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="map-message map-error" style={{ marginTop: '1rem' }}>
              <span style={{ marginRight: '6px' }}>⚠️</span> {errorMsg}
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="map-message map-success" style={{ marginTop: '1rem' }}>
              <span style={{ marginRight: '6px' }}>✅</span> {successMsg}
            </div>
          )}
        </div>

        <div className="leaflet-wrapper">
          {/* Loading overlay on map */}
          {(isLocating || isSearching) && (
            <div className="map-loading-overlay">
              <div className="map-loading-content">
                <div className="spinner spinner-large"></div>
                <p style={{ marginTop: '12px', fontSize: '0.95rem' }}>
                  {isLocating ? 'Getting your location...' : 'Searching for address...'}
                </p>
              </div>
            </div>
          )}

          <MapContainer 
            center={[15.8368, 74.5093]} 
            zoom={13} 
            maxBounds={indiaBounds}
            maxBoundsViscosity={1.0}
            minZoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">Carto</a> contributors'
            />
            {/* Target Salon Marker */}
            <Marker position={[15.8368, 74.5093]}>
              <Popup>
                <strong>StaySync Salon</strong><br/>Your destination.
              </Popup>
            </Marker>
            
            {/* Starting Location Marker */}
            {startLocation && (
              <Marker position={[startLocation.lat, startLocation.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Dynamic Routing Injector */}
            <RoutingControl 
              startLocation={startLocation} 
              onRouteError={handleRouteError} 
              onRouteFound={handleRouteFound}
            />
          </MapContainer>
        </div>
      </div>

      <style>{`
        .map-page-container {
          padding-top: 80px;
          display: flex;
          height: 100vh;
          background-color: var(--bg-dark);
        }

        .map-sidebar {
          width: 380px;
          height: calc(100vh - 80px);
          overflow-y: auto;
          margin: 0;
          border-radius: 0;
          border-right: 1px solid var(--border-color);
          z-index: 10;
        }

        .leaflet-wrapper {
          flex: 1;
          height: calc(100vh - 80px);
          position: relative;
        }

        /* Loading overlay */
        .map-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(30, 28, 27, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          color: var(--text-light);
        }

        .map-loading-content {
          text-align: center;
          animation: fadeIn 0.3s ease;
        }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          vertical-align: middle;
        }

        .spinner-dark {
          border-color: rgba(255,163,150,0.3);
          border-top-color: var(--primary);
        }

        .spinner-large {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Autocomplete dropdown */
        .autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          z-index: 100;
          background: var(--bg-dark);
          border: 1px solid var(--border-color);
          border-top: none;
          border-radius: 0 0 4px 4px;
          max-height: 220px;
          overflow-y: auto;
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
        }

        .autocomplete-item {
          padding: 10px 14px;
          font-size: 0.85rem;
          color: var(--text-light);
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          transition: background-color 0.2s;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .autocomplete-item:hover {
          background-color: rgba(255, 163, 150, 0.1);
          color: var(--primary);
        }

        .autocomplete-item:last-child {
          border-bottom: none;
        }

        /* Message boxes */
        .map-message {
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 0.88rem;
          text-align: center;
          animation: fadeIn 0.3s ease;
        }

        .map-error {
          background-color: rgba(231, 76, 60, 0.12);
          border: 1px solid rgba(231, 76, 60, 0.4);
          color: #ff8a80;
        }

        .map-success {
          background-color: rgba(46, 204, 113, 0.12);
          border: 1px solid rgba(46, 204, 113, 0.4);
          color: #69f0ae;
        }

        /* Routing UI panel dark theme restyling */
        .leaflet-routing-container {
          background-color: rgba(30, 28, 27, 0.95) !important;
          color: var(--text-light) !important;
          border-radius: 8px !important;
          max-height: 400px;
          overflow-y: auto;
          padding: 10px;
        }

        .leaflet-routing-alt {
          background-color: transparent !important;
        }

        .leaflet-routing-alt h2, .leaflet-routing-alt h3 {
          color: var(--primary) !important;
          font-family: var(--font-serif);
        }

        @media (max-width: 800px) {
          .map-page-container {
            flex-direction: column;
          }
          .map-sidebar {
            width: 100%;
            height: auto;
            max-height: 40vh;
          }
          .leaflet-wrapper {
            height: 60vh;
          }
        }
      `}</style>
    </>
  );
};

export default MapPage;
