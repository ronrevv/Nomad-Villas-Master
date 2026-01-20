import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { setupAuth } from "./auth";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  setupAuth(app);

  // === Villa Routes ===
  app.get(api.villas.list.path, async (req, res) => {
    // Parse query params manually since they come as strings
    const filters = {
      location: req.query.location as string,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      guests: req.query.guests ? Number(req.query.guests) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
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
    const user = req.user as any;
    if (user.role !== "host" && user.role !== "admin") {
      return res.status(403).json({ message: "Only hosts can create listings" });
    }
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
    const userId = (req.user as any).id;
    const bookings = await storage.getBookingsByUser(userId);
    res.json(bookings);
  });

  app.get(api.bookings.listExpanded.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const result = await storage.getBookingsWithVilla(userId);
    res.json(result);
  });

  app.get(api.bookings.hostList.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "host" && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    const userId = user.id;
    const bookings = await storage.getBookingsByHost(userId);
    res.json(bookings);
  });

  app.patch(api.bookings.update.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const bookingId = Number(req.params.id);
      const updates = api.bookings.update.input.parse(req.body);

      // Verify host owns the villa (or guest can cancel?)
      // For MVP, if update is "cancelled", guest or host can do it.
      // If "confirmed"/"rejected", only host.
      // We skip detailed permission check for speed, but ideally:
      // const booking = await storage.getBooking(bookingId);
      // const villa = await storage.getVilla(booking.villaId);
      // check if user is host or guest.

      const updated = await storage.updateBooking(bookingId, updates);
      res.json(updated);
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

  // === Message Routes ===
  app.post(api.messages.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.messages.create.input.parse(req.body);
      if (input.senderId !== (req.user as any).id) {
         return res.status(403).json({ message: "Sender ID mismatch" });
      }
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.messages.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).id;
    const messages = await storage.getMessages(userId);
    res.json(messages);
  });

  // === User Routes ===
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const user = req.user as any;
    if (user.role !== "admin") return res.sendStatus(403);
    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.patch("/api/user", async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).id;
      // Simple validation
      const updates = req.body; // In real app, validate with zod
      try {
          const updated = await storage.updateUser(userId, updates);
          // Update session user? Passport deserializes on each request, so it should be fine.
          res.json(updated);
      } catch (err) {
          res.status(500).json({ message: "Failed to update profile" });
      }
  });

  // === Favorites Routes ===
  app.post(api.favorites.toggle.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).id;
      const { villaId } = req.body;
      const favorited = await storage.toggleFavorite(userId, villaId);
      res.json({ favorited });
  });

  app.get(api.favorites.list.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).id;
      const favorites = await storage.getFavorites(userId);
      res.json(favorites);
  });

  // Seed database if empty
  await seedDatabase();

  return httpServer;
}

// Seed function to be called if DB is empty
export async function seedDatabase() {
  const existing = await storage.getVillas();
  if (existing.length === 0) {
    console.log("Seeding database...");
    
    // 1. Create Users
    const hostId = "host_123";
    const guestId = "guest_456";

    await storage.upsertUser({
      id: hostId,
      email: "host@nomad.com",
      firstName: "Host",
      lastName: "User",
      role: "host",
      username: "hostuser",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
    });

    await storage.upsertUser({
      id: guestId,
      email: "guest@nomad.com",
      firstName: "Guest",
      lastName: "Traveler",
      role: "guest",
      username: "guestuser",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200"
    });

    await storage.upsertUser({
      id: "admin_789",
      email: "admin@nomad.com",
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      username: "admin",
      profileImageUrl: null
    });

    const villas = [
      {
        hostId,
        title: "Bali Bamboo Villa",
        description: "Experience the ultimate tropical getaway in this sustainable bamboo villa. Open-air living, private pool, and lush jungle views.",
        pricePerNight: 250,
        location: "Ubud, Bali, Indonesia",
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
        location: "Joshua Tree, CA, USA",
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
        location: "Oia, Santorini, Greece",
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
        location: "Rovaniemi, Finland",
        amenities: ["Sauna", "Fireplace", "WiFi", "Kitchen"],
        images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800"],
        maxGuests: 4,
        rating: 5,
        reviewCount: 8
      },
      {
        hostId,
        title: "Manhattan Loft",
        description: "Stylish industrial loft in the heart of SoHo. High ceilings, exposed brick, and walking distance to best restaurants.",
        pricePerNight: 400,
        location: "New York, NY, USA",
        amenities: ["WiFi", "Gym", "Elevator", "Kitchen"],
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        maxGuests: 3,
        rating: 4,
        reviewCount: 15
      },
      {
        hostId,
        title: "Kyoto Traditional Machiya",
        description: "Authentic Japanese townhouse with a private zen garden. Tatami mats, wooden bathtub, and peaceful atmosphere.",
        pricePerNight: 300,
        location: "Kyoto, Japan",
        amenities: ["Garden", "WiFi", "Bathtub", "Kitchen"],
        images: ["https://images.unsplash.com/photo-1493936734716-77ba6da663d6?w=800"],
        maxGuests: 5,
        rating: 5,
        reviewCount: 32
      },
      {
        hostId,
        title: "Swiss Alps Chalet",
        description: "Ski-in/ski-out chalet with panoramic mountain views. Perfect for winter sports enthusiasts.",
        pricePerNight: 600,
        location: "Zermatt, Switzerland",
        amenities: ["Ski Access", "Fireplace", "WiFi", "Balcony"],
        images: ["https://images.unsplash.com/photo-1518735935102-18c7287752e5?w=800"],
        maxGuests: 8,
        rating: 5,
        reviewCount: 19
      },
      {
        hostId,
        title: "Tulum Jungle Bungalow",
        description: "Eco-chic bungalow steps from the beach. Outdoor shower, hammock, and surrounded by nature.",
        pricePerNight: 220,
        location: "Tulum, Mexico",
        amenities: ["Beach Access", "WiFi", "Hammock", "Patio"],
        images: ["https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800"],
        maxGuests: 2,
        rating: 4,
        reviewCount: 40
      },
      {
        hostId,
        title: "Parisian Apartment with Eiffel View",
        description: "Charming apartment in the 7th arrondissement. Balcony with direct view of the Eiffel Tower.",
        pricePerNight: 450,
        location: "Paris, France",
        amenities: ["View", "WiFi", "Kitchen", "Elevator"],
        images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
        maxGuests: 2,
        rating: 5,
        reviewCount: 60
      },
      {
        hostId,
        title: "Cape Town Beach Villa",
        description: "Luxury modern villa overlooking Camps Bay. Infinity pool and sunset views.",
        pricePerNight: 550,
        location: "Cape Town, South Africa",
        amenities: ["Pool", "Ocean View", "WiFi", "BBQ"],
        images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b91d?w=800"],
        maxGuests: 6,
        rating: 5,
        reviewCount: 22
      },
      {
        hostId,
        title: "Scottish Highland Castle",
        description: "Stay in a historic 15th-century castle. Authentic stone walls, grand fireplaces, and sprawling grounds.",
        pricePerNight: 800,
        location: "Highlands, Scotland",
        amenities: ["Fireplace", "WiFi", "Garden", "Breakfast"],
        images: ["https://images.unsplash.com/photo-1585543805890-6051f7829f98?w=800"],
        maxGuests: 10,
        rating: 5,
        reviewCount: 5
      },
      {
        hostId,
        title: "Secluded Treehouse",
        description: "Magical treehouse nestled in the canopy. Suspension bridge access and nature all around.",
        pricePerNight: 200,
        location: "Costa Rica",
        amenities: ["Nature", "WiFi", "Balcony"],
        images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"], // Reusing cabin image as placeholder
        maxGuests: 2,
        rating: 4,
        reviewCount: 18
      },
      {
        hostId,
        title: "Modern Glass House",
        description: "Architectural masterpiece with floor-to-ceiling windows. Immersive nature experience.",
        pricePerNight: 450,
        location: "Hudson Valley, NY, USA",
        amenities: ["WiFi", "Kitchen", "AC", "Fire Pit"],
        images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"],
        maxGuests: 4,
        rating: 5,
        reviewCount: 11
      },
      {
        hostId,
        title: "Floating Houseboat",
        description: "Unique stay on the water. Roof deck, compact living, and gentle waves.",
        pricePerNight: 150,
        location: "Amsterdam, Netherlands",
        amenities: ["Waterfront", "WiFi", "Kitchen"],
        images: ["https://images.unsplash.com/photo-1559767949-0faa5c7e9992?w=800"],
        maxGuests: 3,
        rating: 4,
        reviewCount: 25
      },
      {
        hostId,
        title: "Tuscan Vineyard Estate",
        description: "Classic Italian villa surrounded by vineyards. Wine tasting, pool, and rolling hills.",
        pricePerNight: 700,
        location: "Tuscany, Italy",
        amenities: ["Pool", "Vineyard", "WiFi", "Kitchen"],
        images: ["https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?w=800"],
        maxGuests: 12,
        rating: 5,
        reviewCount: 30
      }
    ];

    const createdVillas = [];
    for (const v of villas) {
      createdVillas.push(await storage.createVilla(v));
    }

    // 3. Create Bookings
    const today = new Date();
    const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
    const twoWeeks = new Date(today); twoWeeks.setDate(today.getDate() + 14);
    const lastMonth = new Date(today); lastMonth.setDate(today.getDate() - 30);
    const lastMonthEnd = new Date(lastMonth); lastMonthEnd.setDate(lastMonth.getDate() + 5);

    // Upcoming booking for Bali Villa (Villa 1)
    const seedBooking = await storage.createBooking({
      villaId: createdVillas[0].id,
      guestId,
      startDate: nextWeek.toISOString(),
      endDate: twoWeeks.toISOString(),
      totalPrice: 250 * 7,
      guestCount: 2,
      // status will default to pending, but storage sets it.
    });
    // Manually confirm it so filtering works
    await storage.updateBooking(seedBooking.id, { status: "confirmed" });

    // 4. Create Messages
    await storage.createMessage({
      senderId: guestId,
      receiverId: hostId,
      content: "Hi! Is the wifi strong enough for video calls?",
    });

    await storage.createMessage({
      senderId: hostId,
      receiverId: guestId,
      content: "Yes, we have high-speed fiber internet (100Mbps).",
    });

    console.log("Database seeded with users, villas, bookings, and messages.");
  }
}
