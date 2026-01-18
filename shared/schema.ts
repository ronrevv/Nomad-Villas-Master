export * from "./models/auth";
import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

export const villas = pgTable("villas", {
  id: serial("id").primaryKey(),
  hostId: text("host_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  pricePerNight: integer("price_per_night").notNull(),
  location: text("location").notNull(),
  amenities: text("amenities").array().notNull(), // Stored as array of strings
  images: text("images").array().notNull(), // Stored as array of URLs
  maxGuests: integer("max_guests").notNull(),
  rating: integer("rating").default(0), // Average rating
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  villaId: integer("villa_id").notNull().references(() => villas.id),
  guestId: text("guest_id").notNull().references(() => users.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  guestCount: integer("guest_count").notNull(),
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  villaId: integer("villa_id").notNull().references(() => villas.id),
  guestId: text("guest_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const villasRelations = relations(villas, ({ one, many }) => ({
  host: one(users, {
    fields: [villas.hostId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  villa: one(villas, {
    fields: [bookings.villaId],
    references: [villas.id],
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  villa: one(villas, {
    fields: [reviews.villaId],
    references: [villas.id],
  }),
  guest: one(users, {
    fields: [reviews.guestId],
    references: [users.id],
  }),
}));

// Schemas
export const insertVillaSchema = createInsertSchema(villas).omit({ id: true, createdAt: true, rating: true, reviewCount: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, status: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });

// Types
export type Villa = typeof villas.$inferSelect;
export type InsertVilla = z.infer<typeof insertVillaSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
