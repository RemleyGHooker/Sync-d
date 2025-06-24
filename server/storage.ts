import {
  users,
  events,
  eventParticipants,
  eventPhotos,
  chatMessages,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventParticipant,
  type InsertEventParticipant,
  type EventPhoto,
  type InsertEventPhoto,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getUserEvents(userId: string): Promise<Event[]>;
  
  // Event participation
  joinEvent(eventId: string, userId: string): Promise<EventParticipant>;
  leaveEvent(eventId: string, userId: string): Promise<void>;
  getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]>;
  getUserParticipations(userId: string): Promise<(EventParticipant & { event: Event })[]>;
  
  // Event photos
  addEventPhoto(photo: InsertEventPhoto): Promise<EventPhoto>;
  getEventPhotos(eventId: string): Promise<(EventPhoto & { user: User })[]>;
  getUserPhotos(userId: string): Promise<(EventPhoto & { event: Event })[]>;
  
  // Chat messages
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage & { user: User }>;
  getEventMessages(eventId: string): Promise<(ChatMessage & { user: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.startTime));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getUserEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.creatorId, userId))
      .orderBy(desc(events.startTime));
  }

  // Event participation
  async joinEvent(eventId: string, userId: string): Promise<EventParticipant> {
    const [participant] = await db
      .insert(eventParticipants)
      .values({ eventId, userId })
      .returning();
    return participant;
  }

  async leaveEvent(eventId: string, userId: string): Promise<void> {
    await db
      .delete(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      );
  }

  async getEventParticipants(eventId: string): Promise<(EventParticipant & { user: User })[]> {
    return await db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        joinedAt: eventParticipants.joinedAt,
        user: users,
      })
      .from(eventParticipants)
      .innerJoin(users, eq(eventParticipants.userId, users.id))
      .where(eq(eventParticipants.eventId, eventId));
  }

  async getUserParticipations(userId: string): Promise<(EventParticipant & { event: Event })[]> {
    return await db
      .select({
        id: eventParticipants.id,
        eventId: eventParticipants.eventId,
        userId: eventParticipants.userId,
        joinedAt: eventParticipants.joinedAt,
        event: events,
      })
      .from(eventParticipants)
      .innerJoin(events, eq(eventParticipants.eventId, events.id))
      .where(eq(eventParticipants.userId, userId))
      .orderBy(desc(events.startTime));
  }

  // Event photos
  async addEventPhoto(photo: InsertEventPhoto): Promise<EventPhoto> {
    const [newPhoto] = await db
      .insert(eventPhotos)
      .values(photo)
      .returning();
    return newPhoto;
  }

  async getEventPhotos(eventId: string): Promise<(EventPhoto & { user: User })[]> {
    return await db
      .select({
        id: eventPhotos.id,
        eventId: eventPhotos.eventId,
        userId: eventPhotos.userId,
        photoUrl: eventPhotos.photoUrl,
        caption: eventPhotos.caption,
        createdAt: eventPhotos.createdAt,
        user: users,
      })
      .from(eventPhotos)
      .innerJoin(users, eq(eventPhotos.userId, users.id))
      .where(eq(eventPhotos.eventId, eventId))
      .orderBy(desc(eventPhotos.createdAt));
  }

  async getUserPhotos(userId: string): Promise<(EventPhoto & { event: Event })[]> {
    return await db
      .select({
        id: eventPhotos.id,
        eventId: eventPhotos.eventId,
        userId: eventPhotos.userId,
        photoUrl: eventPhotos.photoUrl,
        caption: eventPhotos.caption,
        createdAt: eventPhotos.createdAt,
        event: events,
      })
      .from(eventPhotos)
      .innerJoin(events, eq(eventPhotos.eventId, events.id))
      .where(eq(eventPhotos.userId, userId))
      .orderBy(desc(eventPhotos.createdAt));
  }

  // Chat messages
  async addChatMessage(message: InsertChatMessage): Promise<ChatMessage & { user: User }> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();

    const [messageWithUser] = await db
      .select({
        id: chatMessages.id,
        eventId: chatMessages.eventId,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.id, newMessage.id));

    return messageWithUser;
  }

  async getEventMessages(eventId: string): Promise<(ChatMessage & { user: User })[]> {
    return await db
      .select({
        id: chatMessages.id,
        eventId: chatMessages.eventId,
        userId: chatMessages.userId,
        message: chatMessages.message,
        createdAt: chatMessages.createdAt,
        user: users,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.eventId, eventId))
      .orderBy(chatMessages.createdAt);
  }
}

export const storage = new DatabaseStorage();
