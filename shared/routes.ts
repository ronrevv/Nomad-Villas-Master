import { z } from 'zod';
import { insertVillaSchema, insertBookingSchema, insertReviewSchema, insertMessageSchema, insertFavoriteSchema, villas, bookings, reviews, messages, favorites } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  villas: {
    list: {
      method: 'GET' as const,
      path: '/api/villas',
      input: z.object({
        location: z.string().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        guests: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof villas.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/villas/:id',
      responses: {
        200: z.custom<typeof villas.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/villas',
      input: insertVillaSchema,
      responses: {
        201: z.custom<typeof villas.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings', // Filter by user context in backend
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
      },
    },
    listExpanded: { // For Trips page
        method: 'GET' as const,
        path: '/api/bookings/expanded',
        responses: {
            200: z.array(z.object({
                booking: z.custom<typeof bookings.$inferSelect>(),
                villa: z.custom<typeof villas.$inferSelect>(),
            })),
        }
    },
    hostList: {
      method: 'GET' as const,
      path: '/api/bookings/host',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
      },
    },
    update: {
        method: 'PATCH' as const,
        path: '/api/bookings/:id',
        input: z.object({
            status: z.enum(["pending", "confirmed", "cancelled", "completed", "rejected"]),
        }),
        responses: {
            200: z.custom<typeof bookings.$inferSelect>(),
        }
    }
  },
  reviews: {
    create: {
      method: 'POST' as const,
      path: '/api/reviews',
      input: insertReviewSchema,
      responses: {
        201: z.custom<typeof reviews.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/villas/:id/reviews',
      responses: {
        200: z.array(z.custom<typeof reviews.$inferSelect>()),
      },
    },
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
  },
  favorites: {
      toggle: {
          method: 'POST' as const,
          path: '/api/favorites/toggle',
          input: z.object({ villaId: z.number() }),
          responses: {
              200: z.object({ favorited: z.boolean() }),
          }
      },
      list: {
          method: 'GET' as const,
          path: '/api/favorites',
          responses: {
              200: z.array(z.custom<typeof villas.$inferSelect>()), // Return villas directly
          }
      }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
