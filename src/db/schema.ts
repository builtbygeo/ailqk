import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const spots = sqliteTable("spots", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  type: text("type", { enum: ["wild", "host"] }).notNull().default("wild"),
  region: text("region").notNull(),
  imageUrl: text("image_url"),
  averageRating: real("average_rating").default(0),
  reviewsCount: integer("reviews_count").default(0),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).default("pending"),
  legalStatus: text("legal_status", { enum: ["tolerated", "approved", "protected", "strict"] }).default("tolerated"),
  riskLevel: text("risk_level", { enum: ["low", "medium", "high", "extreme"] }).default("low"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdBy: text("created_by"),
});

export const amenities = sqliteTable("amenities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  spotId: text("spot_id").references(() => spots.id, { onDelete: "cascade" }),
  water: integer("water", { mode: "boolean" }).default(false),
  shade: integer("shade", { mode: "boolean" }).default(false),
  flatGround: integer("flat_ground", { mode: "boolean" }).default(false),
  cellSignal: integer("cell_signal", { mode: "boolean" }).default(false),
  firePit: integer("fire_pit", { mode: "boolean" }).default(false),
  petFriendly: integer("pet_friendly", { mode: "boolean" }).default(false),
  toilet: integer("toilet", { mode: "boolean" }).default(false),
  electricity: integer("electricity", { mode: "boolean" }).default(false),
  wifi: integer("wifi", { mode: "boolean" }).default(false),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  spotId: text("spot_id").references(() => spots.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
