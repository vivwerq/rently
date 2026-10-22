export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula, rounded to 1 decimal place.
 */
export function calculateDistanceKm(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 1 decimal place, minimum 0.5 km
  return Math.max(0.5, Math.round(distance * 10) / 10);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Serviceability check: returns true if the distance is within practical delivery radius.
 */
export function isWithinDeliveryRadius(distanceKm: number, maxRadiusKm: number = 25): boolean {
  return distanceKm <= maxRadiusKm;
}
