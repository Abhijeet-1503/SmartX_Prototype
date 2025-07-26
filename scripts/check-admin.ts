import 'dotenv/config';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function checkAdmin() {
  try {
    const admin = await db.select().from(users).where(eq(users.username, 'admin'));
    console.log('Admin user:', admin);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
}

checkAdmin();
