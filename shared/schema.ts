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
  status: text("status", { enum: ["pending", "confirmed", "cancelled", "completed", "rejected"] }).default("pending").notNull(),
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

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: text("sender_id").notNull().references(() => users.id),
  receiverId: text("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  villaId: integer("villa_id").notNull().references(() => villas.id),
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
  favoritedBy: many(favorites),
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

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender"
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver"
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  villa: one(villas, {
    fields: [favorites.villaId],
    references: [villas.id],
  }),
}));

// Schemas
export const insertVillaSchema = createInsertSchema(villas).omit({ id: true, createdAt: true, rating: true, reviewCount: true });
export const insertBookingSchema = createInsertSchema(bookings).omit({ id: true, createdAt: true, status: true });
export const insertReviewSchema = createInsertSchema(reviews).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, read: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true, createdAt: true });

// Types
export type Villa = typeof villas.$inferSelect;
export type InsertVilla = z.infer<typeof insertVillaSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
