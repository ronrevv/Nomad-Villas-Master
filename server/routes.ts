import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Villa Routes ===
  app.get(api.villas.list.path, async (req, res) => {
    // Parse query params manually since they come as strings
    const filters = {
      location: req.query.location as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      guests: req.query.guests ? Number(req.query.guests) : undefined,
    };
    const villas = await storage.getVillas(filters);
    res.json(villas);
  });

  app.get(api.villas.get.path, async (req, res) => {
    const villa = await storage.getVilla(Number(req.params.id));
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }
    res.json(villa);
  });

  app.post(api.villas.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.villas.create.input.parse(req.body);
      const villa = await storage.createVilla(input);
      res.status(201).json(villa);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Booking Routes ===
  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking(input);
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub; // From Replit Auth
    
    // If we had a role check, we could return host bookings vs guest bookings
    // For now, return guest bookings
    const bookings = await storage.getBookingsByUser(userId);
    res.json(bookings);
  });

  // === Review Routes ===
  app.post(api.reviews.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.reviews.list.path, async (req, res) => {
    const reviews = await storage.getReviewsByVilla(Number(req.params.id));
    res.json(reviews);
  });

  // Seed database if empty
  await seedDatabase();

  return httpServer;
}

// Seed function to be called if DB is empty
export async function seedDatabase() {
  const existing = await storage.getVillas();
  if (existing.length === 0) {
    // Create a dummy host user first? 
    // Since we use Replit auth, we can't easily fake users with specific IDs unless we insert them directly.
    // We'll create a dummy host record in the 'users' table if we can.
    
    const hostId = "host_123";
    await storage.upsertUser({
      id: hostId,
      email: "host@example.com",
      firstName: "Host",
      lastName: "User",
      role: "host",
      username: "hostuser"
    });

    const villas = [
      {
        hostId,
        title: "Bali Bamboo Villa",
        description: "Experience the ultimate tropical getaway in this sustainable bamboo villa. Open-air living, private pool, and lush jungle views.",
        pricePerNight: 250,
        location: "Bali, Indonesia",
        amenities: ["Pool", "WiFi", "Kitchen", "AC"],
        images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800", "https://images.unsplash.com/photo-1540541338287-417002060f02?w=800"],
        maxGuests: 4,
        rating: 5,
        reviewCount: 12
      },
      {
        hostId,
        title: "Modern Desert Retreat",
        description: "Minimalist desert home designed for peace and tranquility. Stargaze from the hot tub or explore the nearby national park.",
        pricePerNight: 350,
        location: "Joshua Tree, CA",
        amenities: ["Hot Tub", "WiFi", "Fire Pit", "Parking"],
        images: ["https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800", "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800"],
        maxGuests: 6,
        rating: 4,
        reviewCount: 28
      },
      {
        hostId,
        title: "Santorini Cliffside Suite",
        description: "Breathtaking views of the caldera from your private terrace. Traditional Cycladic architecture with modern luxury.",
        pricePerNight: 500,
        location: "Santorini, Greece",
        amenities: ["Ocean View", "WiFi", "Breakfast", "Pool"],
        images: ["https://images.unsplash.com/photo-1570213489059-0ecd6a1bd16f?w=800", "https://images.unsplash.com/photo-1496664444929-8c75efb9546f?w=800"],
        maxGuests: 2,
        rating: 5,
        reviewCount: 45
      },
      {
        hostId,
        title: "Nordic Forest Cabin",
        description: "Cozy up in this secluded cabin surrounded by pines. Wood-burning stove, sauna, and direct access to hiking trails.",
        pricePerNight: 180,
        location: "Lapland, Finland",
        amenities: ["Sauna", "Fireplace", "WiFi", "Kitchen"],
        images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"],
        maxGuests: 4,
        rating: 5,
        reviewCount: 8
      }
    ];

    for (const v of villas) {
      await storage.createVilla(v);
    }
    console.log("Database seeded with villas");
  }
}
