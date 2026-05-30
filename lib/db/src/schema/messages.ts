import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { conversations } from "./conversations";

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: varchar("sender_id", { length: 255 }).notNull(),
    senderType: varchar("sender_type", { length: 50 }).notNull().default("user"),
    content: text("content").notNull(),
    messageType: varchar("message_type", { length: 50 })
      .notNull()
      .default("text"),
    attachments: jsonb("attachments")
      .$type<
        Array<{
          url: string;
          name: string;
          size: number;
          mimeType: string;
        }>
      >()
      .default([]),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("messages_conversation_idx").on(t.conversationId),
    index("messages_sender_idx").on(t.senderId),
    index("messages_created_at_idx").on(t.createdAt),
    index("messages_read_at_idx").on(t.readAt),
  ],
);

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
