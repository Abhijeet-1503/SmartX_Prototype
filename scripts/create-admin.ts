import 'dotenv/config';
import { db } from "../server/db";
import { users } from "../shared/schema";

async function createAdminUser() {
  try {
    await db.insert(users).values({
      username: "admin",
      password: "admin123", // You should change this password
      role: "god",
      name: "System Administrator",
      email: "admin@example.com",
      isActive: true
    });
    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
  process.exit();
}

createAdminUser();
