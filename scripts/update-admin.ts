import 'dotenv/config';
import { db } from '../server/db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function updateAdminRole() {
  try {
    const updated = await db.update(users)
      .set({ role: 'god' })
      .where(eq(users.username, 'admin'))
      .returning();
    console.log('Updated admin user:', updated);
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
}

updateAdminRole();
