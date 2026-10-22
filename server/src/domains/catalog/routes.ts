import type { FastifyPluginAsync } from 'fastify';
import { dbStore, LOCALITIES, type ListingItem, type LocalityOption } from '../../core/db.ts';

function resolveLocality(localityId?: string): LocalityOption {
  if (localityId) {
    const found = LOCALITIES.find(l => l.id === localityId);
    if (found) return found;
  }
  return LOCALITIES[0]; // Default: CU Gharuan
}

export const catalogRoutes: FastifyPluginAsync = async (fastify) => {
  // Query catalog listings
  fastify.get('/listings', async (request, reply) => {
    const query = request.query as {
      localityId?: string;
      category?: string;
      mode?: string;
      search?: string;
      fuel?: string;
      transmission?: string;
      campusOnly?: string;
      sortBy?: string;
    };

    const userLocality = resolveLocality(query.localityId);
    let listings = dbStore.getListings(userLocality);

    // Filter by category
    if (query.category) {
      const cat = query.category.toUpperCase();
      listings = listings.filter(item => item.category === cat);
    }

    // Filter by mode
    if (query.mode) {
      const mode = query.mode.toUpperCase();
      listings = listings.filter(item => item.mode === mode);
    }

    // Filter by campus eligible
    if (query.campusOnly === 'true') {
      listings = listings.filter(item => item.campusEligible);
    }

    // Filter by fuel
    if (query.fuel) {
      const fuelLower = query.fuel.toLowerCase();
      listings = listings.filter(item => item.carSpecs?.fuel.toLowerCase().includes(fuelLower));
    }

    // Filter by transmission
    if (query.transmission) {
      const transLower = query.transmission.toLowerCase();
      listings = listings.filter(item => item.carSpecs?.transmission.toLowerCase().includes(transLower));
    }

    // Search query in title, location, description
    if (query.search) {
      const term = query.search.toLowerCase().trim();
      listings = listings.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.location.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        (item.carSpecs && `${item.carSpecs.fuel} ${item.carSpecs.transmission}`.toLowerCase().includes(term))
      );
    }

    // Sorting
    const sort = query.sortBy || 'distance';
    if (sort === 'distance') {
      listings.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'priceAsc') {
      listings.sort((a, b) => a.price - b.price);
    } else if (sort === 'priceDesc') {
      listings.sort((a, b) => b.price - a.price);
    }

    return reply.send({
      success: true,
      locality: userLocality,
      count: listings.length,
      listings
    });
  });

  // Get single listing by ID
  fastify.get<{ Params: { id: string } }>('/listings/:id', async (request, reply) => {
    const { id } = request.params;
    const query = request.query as { localityId?: string };
    const userLocality = resolveLocality(query.localityId);

    const item = dbStore.getListingById(id, userLocality);
    if (!item) {
      return reply.code(404).send({ error: `Listing with ID '${id}' not found.` });
    }

    return reply.send({
      success: true,
      locality: userLocality,
      listing: item
    });
  });

  // Create new listing (host / peer listing)
  fastify.post<{ Body: Partial<ListingItem> }>('/listings', async (request, reply) => {
    const body = request.body;
    if (!body.title || !body.category || !body.price) {
      return reply.code(400).send({
        error: 'title, category, and price are required to create a listing.'
      });
    }

    const newId = `list-${Date.now()}`;
    const userLocality = resolveLocality(body.hubLocalityId);

    const created: ListingItem = {
      id: newId,
      title: body.title,
      category: body.category as ListingItem['category'],
      mode: body.mode || 'RENT',
      price: Number(body.price),
      priceUnit: body.priceUnit || '/day',
      deposit: Number(body.deposit || 0),
      condition: body.condition || 'Verified Good',
      location: body.location || userLocality.name,
      distanceKm: 0,
      coordinates: body.coordinates || userLocality.coordinates,
      hubLocalityId: body.hubLocalityId || userLocality.id,
      primaryImage: body.primaryImage || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
      campusEligible: body.campusEligible ?? true,
      operator: body.operator || {
        name: 'Peer Host Partner',
        verified: true,
        rating: 4.8,
        tripsCompleted: 1,
        permitVerified: true
      },
      carSpecs: body.carSpecs,
      makerSpecs: body.makerSpecs,
      resaleSpecs: body.resaleSpecs
    };

    dbStore.addListing(created);

    return reply.code(201).send({
      success: true,
      message: 'Listing successfully published to Rently Tri-City catalog.',
      listing: created
    });
  });
};
