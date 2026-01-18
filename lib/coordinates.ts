/**
 * Utility functions untuk ekstraksi dan validasi koordinat dari Google Maps URLs
 * Mendukung berbagai format URL Google Maps termasuk shortlinks
 */

import { API_URL } from './api';

export interface Coordinates {
    lat: number;
    lng: number;
}

/**
 * Ekstrak koordinat dari berbagai format Google Maps URL
 * @param mapsUrl - URL Google Maps
 * @returns Coordinates object atau null jika tidak ditemukan
 */
export function extractCoordinates(mapsUrl: string): Coordinates | null {
    if (!mapsUrl) return null;

    // Enhanced patterns untuk berbagai format Google Maps URL
    const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,           // @lat,lng format
        /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,          // q=lat,lng format
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,         // ll=lat,lng format
        /place\/.*\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/, // place/@lat,lng format
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,       // !3d lat !4d lng format
        /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,     // center=lat,lng format
        /destination=(-?\d+\.?\d*),(-?\d+\.?\d*)/, // destination=lat,lng format
        /saddr=(-?\d+\.?\d*),(-?\d+\.?\d*)/,      // saddr=lat,lng format
        /daddr=(-?\d+\.?\d*),(-?\d+\.?\d*)/,      // daddr=lat,lng format
    ];

    for (const pattern of patterns) {
        const match = mapsUrl.match(pattern);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);

            // Validasi koordinat
            if (isValidCoordinate(lat, lng)) {
                return { lat, lng };
            }
        }
    }

    // Try !1d lng !2d lat format (reversed)
    const reversedPattern = /!1d(-?\d+\.?\d*)!2d(-?\d+\.?\d*)/;
    const reversedMatch = mapsUrl.match(reversedPattern);
    if (reversedMatch) {
        const lng = parseFloat(reversedMatch[1]);
        const lat = parseFloat(reversedMatch[2]);
        if (isValidCoordinate(lat, lng)) {
            return { lat, lng };
        }
    }

    return null;
}

/**
 * Check if URL is a shortlink
 */
export function isShortlink(url: string): boolean {
    if (!url) return false;
    return url.includes('goo.gl') || url.includes('maps.app.goo.gl');
}

/**
 * Resolve Google Maps shortlink dan ekstrak koordinat via backend API
 * @param mapsUrl - URL Google Maps (bisa shortlink atau full URL)
 * @returns Promise<Coordinates | null>
 */
export async function resolveAndExtractCoordinates(mapsUrl: string): Promise<Coordinates | null> {
    if (!mapsUrl) return null;

    // First try direct extraction (faster)
    const directCoords = extractCoordinates(mapsUrl);
    if (directCoords) {
        return directCoords;
    }

    // If direct extraction failed and it's a shortlink, resolve via API
    if (isShortlink(mapsUrl)) {
        try {
            const response = await fetch(`${API_URL}/maps/coordinates`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url: mapsUrl })
            });

            const data = await response.json();

            if (data.success && data.data.coordinates) {
                return {
                    lat: data.data.coordinates.latitude,
                    lng: data.data.coordinates.longitude
                };
            }
        } catch (error) {
            console.warn('Failed to resolve shortlink:', error);
        }
    }

    return null;
}

/**
 * Validasi apakah koordinat valid
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @returns boolean
 */
export function isValidCoordinate(lat: number, lng: number): boolean {
    return (
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180
    );
}

/**
 * Hitung jarak antara dua titik koordinat menggunakan Haversine formula
 * @param lat1 - Latitude titik 1
 * @param lng1 - Longitude titik 1
 * @param lat2 - Latitude titik 2
 * @param lng2 - Longitude titik 2
 * @returns Jarak dalam kilometer
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Convert degrees to radians
 */
function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Format jarak untuk display
 * @param distanceKm - Jarak dalam kilometer
 * @returns String formatted (e.g., "1.5 km" atau "500 m")
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    return `${distanceKm.toFixed(1)} km`;
}

/**
 * Cek apakah koordinat berada dalam radius tertentu dari titik pusat
 * @param centerLat - Latitude pusat
 * @param centerLng - Longitude pusat
 * @param pointLat - Latitude titik yang dicek
 * @param pointLng - Longitude titik yang dicek
 * @param radiusKm - Radius dalam kilometer
 * @returns boolean
 */
export function isWithinRadius(
    centerLat: number,
    centerLng: number,
    pointLat: number,
    pointLng: number,
    radiusKm: number
): boolean {
    const distance = calculateDistance(centerLat, centerLng, pointLat, pointLng);
    return distance <= radiusKm;
}

/**
 * Get coordinates dari UMKM object (support legacy dan new format)
 * Synchronous version - tidak resolve shortlinks
 * @param umkm - Object UMKM dengan field lokasi atau maps
 * @returns Coordinates atau null
 */
export function getUmkmCoordinates(umkm: {
    lokasi?: { latitude?: number; longitude?: number };
    maps?: string;
    linkMaps?: string;
}): Coordinates | null {
    // Priority 1: Use lokasi field if available
    if (umkm.lokasi?.latitude && umkm.lokasi?.longitude) {
        return {
            lat: umkm.lokasi.latitude,
            lng: umkm.lokasi.longitude
        };
    }

    // Priority 2: Extract from Google Maps URL
    const mapsUrl = umkm.maps || umkm.linkMaps;
    if (mapsUrl) {
        return extractCoordinates(mapsUrl);
    }

    return null;
}

/**
 * Get coordinates dari UMKM object - Async version yang bisa resolve shortlinks
 * @param umkm - Object UMKM dengan field lokasi atau maps
 * @returns Promise<Coordinates | null>
 */
export async function getUmkmCoordinatesAsync(umkm: {
    lokasi?: { latitude?: number; longitude?: number };
    maps?: string;
    linkMaps?: string;
}): Promise<Coordinates | null> {
    // Priority 1: Use lokasi field if available
    if (umkm.lokasi?.latitude && umkm.lokasi?.longitude) {
        return {
            lat: umkm.lokasi.latitude,
            lng: umkm.lokasi.longitude
        };
    }

    // Priority 2: Extract from Google Maps URL (dengan resolve shortlink)
    const mapsUrl = umkm.maps || umkm.linkMaps;
    if (mapsUrl) {
        return await resolveAndExtractCoordinates(mapsUrl);
    }

    return null;
}

