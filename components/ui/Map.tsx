'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Marker {
  id: string;
  nama: string;
  lat: number;
  lng: number;
  kategori?: string;
  distance?: number;
  alamat?: string;
}

interface MapProps {
  markers: Marker[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onClick?: (marker: Marker) => void;
  userLocation?: { lat: number; lng: number };
  showUserLocation?: boolean;
}

// Custom icons
const createIcon = (color: string) => {
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
        <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.97-4.03-9-9-9zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
      </svg>
    `)}`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

export default function Map({
  markers,
  center = { lat: -7.5598, lng: 110.8290 }, // Default: Solo, Indonesia
  zoom = 14,
  height = '400px',
  onClick,
  userLocation,
  showUserLocation = false,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Create map
    mapRef.current = L.map(mapContainer.current).setView(
      [center.lat, center.lng],
      zoom
    );

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      // Cleanup
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.remove();
    });
    markersRef.current = {};

    // Add new markers
    markers.forEach((marker) => {
      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createIcon('#3B82F6'), // Blue
      }).addTo(mapRef.current!);

      // Create popup content
      const popupContent = `
        <div class="font-sans">
          <h3 class="font-bold text-gray-900 mb-1">${marker.nama}</h3>
          <p class="text-xs text-gray-600 mb-1">${marker.kategori || 'UMKM'}</p>
          ${marker.distance
          ? `<p class="text-xs font-semibold text-blue-600">📍 ${marker.distance.toFixed(1)} km</p>`
          : ''
        }
          ${marker.alamat
          ? `<p class="text-xs text-gray-600 mt-2">${marker.alamat}</p>`
          : ''
        }
        </div>
      `;

      leafletMarker.bindPopup(popupContent);

      // Add click handler
      leafletMarker.on('click', () => {
        if (onClick) {
          onClick(marker);
        }
        leafletMarker.openPopup();
      });

      markersRef.current[marker.id] = leafletMarker;
    });

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const group = new L.FeatureGroup(Object.values(markersRef.current));
      mapRef.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }
  }, [markers, onClick]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Add new user marker if location is provided
    if (showUserLocation && userLocation) {
      userMarkerRef.current = L.marker(
        [userLocation.lat, userLocation.lng],
        {
          icon: createIcon('#10B981'), // Green
        }
      ).addTo(mapRef.current);

      userMarkerRef.current.bindPopup('📍 Lokasi Anda');
      userMarkerRef.current.openPopup();
    }
  }, [userLocation, showUserLocation]);

  return (
    <div
      ref={mapContainer}
      style={{
        height,
        borderRadius: '0.75rem',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      }}
      className="border-2 border-gray-200"
    />
  );
}
