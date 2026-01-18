import { z } from 'zod';
import { insertVillaSchema, insertBookingSchema, insertReviewSchema, villas, bookings, reviews } from './schema';

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
