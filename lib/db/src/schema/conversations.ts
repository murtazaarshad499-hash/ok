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
import { users } from "./users";
import { leadsTable } from "./leads";

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    leadId: integer("lead_id").references(() => leadsTable.id, {
      onDelete: "cascade",
    }),
    userId: varchar("user_id", { length: 255 }).references(() => users.id, {
      onDelete: "set null",
    }),
    channel: varchar("channel", { length: 50 }).notNull().default("email"),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    subject: text("subject"),
    externalId: text("external_id"),
    lastMessageAt: timestamp("last_message_at"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [
    index("conversations_lead_idx").on(t.leadId),
    index("conversations_user_idx").on(t.userId),
    index("conversations_channel_idx").on(t.channel),
    index("conversations_status_idx").on(t.status),
    index("conversations_last_message_idx").on(t.lastMessageAt),
  ],
);

export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
