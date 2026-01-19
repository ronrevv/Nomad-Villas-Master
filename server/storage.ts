import {
  users, villas, bookings, reviews, messages,
  type User, type InsertUser,
  type Villa, type InsertVilla,
  type Booking, type InsertBooking,
  type Review, type InsertReview,
  type Message, type InsertMessage
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>;

  // Villas
  getVillas(filters?: { location?: string; minPrice?: number; maxPrice?: number; guests?: number }): Promise<Villa[]>;
  getVilla(id: number): Promise<Villa | undefined>;
  createVilla(villa: InsertVilla): Promise<Villa>;
  
  // Bookings
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByHost(hostId: string): Promise<Booking[]>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByVilla(villaId: number): Promise<Review[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(userId: string): Promise<Message[]>;

  // Session Store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private villas: Map<number, Villa>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  private currentVillaId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentMessageId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.villas = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    this.currentVillaId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentMessageId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  // Auth methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const id = userData.id || `user_${Date.now()}`; // Ensure ID exists
    const existingUser = await this.getUser(id);

    const user: User = {
      ...userData,
      id: id,
      username: userData.username || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      email: userData.email || null,
      profileImageUrl: userData.profileImageUrl || null,
      role: userData.role || "guest", // Default to guest
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    this.users.set(id, user);
    return user;
  }

  // Villa methods
  async getVillas(filters?: { location?: string; minPrice?: number; maxPrice?: number; guests?: number }): Promise<Villa[]> {
    let allVillas = Array.from(this.villas.values());

    if (filters) {
      if (filters.location) {
        allVillas = allVillas.filter(v => v.location.toLowerCase().includes(filters.location!.toLowerCase()));
      }
      if (filters.minPrice) {
        allVillas = allVillas.filter(v => v.pricePerNight >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        allVillas = allVillas.filter(v => v.pricePerNight <= filters.maxPrice!);
      }
      if (filters.guests) {
        allVillas = allVillas.filter(v => v.maxGuests >= filters.guests!);
      }
    }
    
    return allVillas;
  }

  async getVilla(id: number): Promise<Villa | undefined> {
    return this.villas.get(id);
  }

  async createVilla(villa: InsertVilla): Promise<Villa> {
    const id = this.currentVillaId++;
    const newVilla: Villa = {
      ...villa,
      id,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
    };
    this.villas.set(id, newVilla);
    return newVilla;
  }

  // Booking methods
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking: Booking = {
      ...booking,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.guestId === userId,
    );
  }
  
  async getBookingsByHost(hostId: string): Promise<Booking[]> {
    const hostVillaIds = Array.from(this.villas.values())
      .filter(v => v.hostId === hostId)
      .map(v => v.id);

    return Array.from(this.bookings.values()).filter(
      (booking) => hostVillaIds.includes(booking.villaId)
    );
  }

  // Review methods
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, newReview);

    // Update villa rating
    const villa = this.villas.get(review.villaId);
    if (villa) {
      const villaReviews = await this.getReviewsByVilla(villa.id);
      const allReviews = [...villaReviews];
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      villa.rating = Math.round(totalRating / allReviews.length);
      villa.reviewCount = allReviews.length;
      this.villas.set(villa.id, villa);
    }

    return newReview;
  }

  async getReviewsByVilla(villaId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.villaId === villaId,
    );
  }

  // Message methods
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const newMessage: Message = {
      ...message,
      id,
      read: false,
      createdAt: new Date(),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (m) => m.senderId === userId || m.receiverId === userId
    );
  }
}

export const storage = new MemStorage();
