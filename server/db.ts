import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create pool with error handling
let pool: Pool;
try {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Test connection
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
  });
} catch (error: any) {
  console.error("Failed to create database pool:", error?.message || error);
  throw error;
}

export const db = drizzle(pool, { schema });


