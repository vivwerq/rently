import type { FastifyPluginAsync } from 'fastify';
import { LOCALITIES, calculateDistanceKm, type Coordinates } from '../../core/db.ts';

const CHANDIGARH_CENTER: Coordinates = { lat: 30.7333, lng: 76.7794 };
const MAX_SERVICEABLE_RADIUS_KM = 45;

export const geoRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all Tri-City localities & campus hubs
  fastify.get('/localities', async (_request, reply) => {
    return reply.send({
      success: true,
      total: LOCALITIES.length,
      localities: LOCALITIES
    });
  });

  // Check serviceability and delivery options for a location
  fastify.get('/serviceability', async (request, reply) => {
    const query = request.query as {
      lat?: string;
      lng?: string;
      localityId?: string;
    };

    let targetCoords: Coordinates | null = null;
    let resolvedLocality = LOCALITIES[0];

    if (query.localityId) {
      const found = LOCALITIES.find(l => l.id === query.localityId);
      if (found) {
        resolvedLocality = found;
        targetCoords = found.coordinates;
      }
    }

    if (!targetCoords && query.lat && query.lng) {
      const lat = parseFloat(query.lat);
      const lng = parseFloat(query.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        targetCoords = { lat, lng };
      }
    }

    if (!targetCoords) {
      targetCoords = resolvedLocality.coordinates;
    }

    // Distance to center of Tri-City
    const distanceToCenterKm = calculateDistanceKm(targetCoords, CHANDIGARH_CENTER);
    const isServiceable = distanceToCenterKm <= MAX_SERVICEABLE_RADIUS_KM;

    // Find closest hub
    let nearestHub = LOCALITIES[0];
    let minDistance = calculateDistanceKm(targetCoords, nearestHub.coordinates);

    for (const loc of LOCALITIES) {
      const dist = calculateDistanceKm(targetCoords, loc.coordinates);
      if (dist < minDistance) {
        minDistance = dist;
        nearestHub = loc;
      }
    }

    // Delivery fee tier calculation
    let deliveryAvailable = isServiceable;
    let estimatedDeliveryFee = 0;

    if (minDistance <= 3) {
      estimatedDeliveryFee = 0; // Free campus/hub handover
    } else if (minDistance <= 10) {
      estimatedDeliveryFee = 149;
    } else if (minDistance <= 25) {
      estimatedDeliveryFee = 299;
    } else if (isServiceable) {
      estimatedDeliveryFee = 499;
    } else {
      deliveryAvailable = false;
    }

    return reply.send({
      serviceable: isServiceable,
      targetCoordinates: targetCoords,
      nearestLocality: nearestHub,
      distanceToNearestHubKm: minDistance,
      deliveryAvailable,
      estimatedDeliveryFee,
      safeHandoverSpot: nearestHub.safeHandoverSpot,
      message: isServiceable
        ? `Serviceable within Tri-City cluster (${nearestHub.name})`
        : 'Outside standard delivery zone. Self-pickup at nearest hub available.'
    });
  });
};
