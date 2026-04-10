import { db } from './src/db';
import { spots } from './src/db/schema';
import { count } from 'drizzle-orm';

async function checkSpots() {
  try {
    const result = await db.select({ value: count() }).from(spots).get();
    console.log(`LOCATIONS_COUNT: ${result?.value ?? 0}`);
  } catch (err) {
    console.error('ERROR_CHECKING_SPOTS', err);
  }
}

checkSpots();
