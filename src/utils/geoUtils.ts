import { GpsCoordinates, ReverseGeocodeResult } from '../types/exif';

export function decimalToDms(decimal: number, isLatitude: boolean): string {
  const direction = isLatitude
    ? decimal >= 0
      ? 'N'
      : 'S'
    : decimal >= 0
      ? 'E'
      : 'W';

  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

  return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
}

const geocodeCache = new Map<string, ReverseGeocodeResult>();

export async function reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult | null> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'fr, en',
          'User-Agent': 'SamsungS23-OsmAnd-ExifNavigator/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();
    const address = data.address || {};

    const result: ReverseGeocodeResult = {
      displayName: data.display_name || `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
      road: address.road || address.pedestrian || address.street,
      suburb: address.suburb || address.neighbourhood,
      city: address.city || address.town || address.village || address.municipality,
      state: address.state || address.region,
      country: address.country,
      postcode: address.postcode,
    };

    geocodeCache.set(cacheKey, result);
    return result;
  } catch (err) {
    console.warn('Reverse geocoding failed or timed out:', err);
    return null;
  }
}

export function buildOsmAndUrls(gps: GpsCoordinates, label = 'Photo Samsung S23') {
  const lat = gps.latitude;
  const lon = gps.longitude;
  const encodedTitle = encodeURIComponent(label);

  return {
    // Standard Android Geo URI (OsmAnd & all GPS apps handle this natively and reliably on Android)
    geoUri: `geo:${lat},${lon}?q=${lat},${lon}(${encodedTitle})`,

    // Official OsmAnd App Link (Android automatically catches this domain to open OsmAnd app)
    osmandGoLink: `https://osmand.net/go?lat=${lat}&lon=${lon}&z=17`,

    // Android Intent targeting OsmAnd package directly
    androidIntentNavigate: `intent:#Intent;action=android.intent.action.VIEW;data=geo:${lat},${lon}?q=${lat},${lon}(${encodedTitle});package=net.osmand;end`,

    // Android Intent for OsmAnd+ (Plus edition)
    androidIntentNavigatePlus: `intent:#Intent;action=android.intent.action.VIEW;data=geo:${lat},${lon}?q=${lat},${lon}(${encodedTitle});package=net.osmand.plus;end`,

    // Direct OsmAnd API navigation intent
    navigateApi: `osmand.api://navigate?lat=${lat}&lon=${lon}&title=${encodedTitle}&profile=car`,

    // Direct OsmAnd API show point on map
    showPointApi: `osmand.api://show_point?lat=${lat}&lon=${lon}&title=${encodedTitle}`,

    // OsmAnd live web map preview
    osmandWeb: `https://osmand.net/map?pin=${lat},${lon}#17/${lat}/${lon}`,

    // OpenStreetMap direct link
    osmWeb: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`,

    // Google Maps comparison link
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
  };
}

export function generateGpxString(gps: GpsCoordinates, fileName: string, timestamp?: string): string {
  const lat = gps.latitude;
  const lon = gps.longitude;
  const ele = gps.altitude !== undefined ? `\n    <ele>${gps.altitude.toFixed(1)}</ele>` : '';
  const time = timestamp || new Date().toISOString();
  const safeName = (fileName || 'Samsung_S23_Photo').replace(/[^a-zA-Z0-9_\-\.]/g, '_');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Samsung S23 OsmAnd EXIF Extractor" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${safeName}</name>
    <desc>Coordonnées GPS extraites des métadonnées EXIF Samsung Galaxy S23 pour OsmAnd</desc>
    <time>${time}</time>
  </metadata>
  <wpt lat="${lat}" lon="${lon}">${ele}
    <time>${time}</time>
    <name>${safeName}</name>
    <desc>Latitude: ${gps.latitudeDMS}, Longitude: ${gps.longitudeDMS}${gps.altitude ? `, Altitude: ${gps.altitude}m` : ''}</desc>
    <sym>camera</sym>
    <type>Photo Waypoint</type>
  </wpt>
</gpx>`;
}

export function downloadGpxFile(gps: GpsCoordinates, fileName: string, timestamp?: string) {
  const gpxContent = generateGpxString(gps, fileName, timestamp);
  const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanName}_osmand.gpx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
