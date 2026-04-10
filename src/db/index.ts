import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "file:./local.db";

// Cloudflare Edge / build-time safety
const client = createClient({
  url: dbUrl.startsWith("file:") && (process.env.NEXT_RUNTIME === "edge" || process.env.NODE_ENV === "production") 
    ? "libsql://dummy-for-build.turso.io" 
    : dbUrl,
});

export const db = drizzle(client, { schema });
