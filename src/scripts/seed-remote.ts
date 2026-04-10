import { db } from '../db';
import { spots, amenities } from '../db/schema';
import fs from 'fs';
import path from 'path';

async function seedRemote() {
  console.log('🚀 Starting synchronization to remote database...');

  const spotsPath = path.join(process.cwd(), 'scratch', 'spots_dump.json');
  const amenitiesPath = path.join(process.cwd(), 'scratch', 'amenities_dump.json');

  if (!fs.existsSync(spotsPath)) {
    console.error('❌ Error: spots_dump.json not found in scratch/');
    return;
  }

  const spotsData = JSON.parse(fs.readFileSync(spotsPath, 'utf8'));
  const amenitiesData = JSON.parse(fs.readFileSync(amenitiesPath, 'utf8'));

  console.log(`📊 Found ${spotsData.length} spots and ${amenitiesData.length} amenities sets.`);

  for (const spot of spotsData) {
    try {
      // Upsert spot
      await db.insert(spots).values({
        id: spot.id,
        name: spot.name,
        description: spot.description,
        latitude: spot.latitude,
        longitude: spot.longitude,
        type: spot.type,
        region: spot.region,
        imageUrl: spot.imageUrl,
        averageRating: spot.averageRating,
        reviewsCount: spot.reviewsCount,
        legalStatus: spot.legalStatus,
        riskLevel: spot.riskLevel,
        status: spot.status || 'approved',
        createdBy: spot.createdBy,
        createdAt: new Date(spot.createdAt),
      }).onConflictDoUpdate({
        target: spots.id,
        set: { status: spot.status || 'approved' }
      });
      
      console.log(`✅ Synced spot: ${spot.name}`);
    } catch (err) {
      console.error(`❌ Error syncing spot ${spot.name}:`, err);
    }
  }

  for (const amenity of amenitiesData) {
    try {
      await db.insert(amenities).values({
        spotId: amenity.spotId,
        water: !!amenity.water,
        shade: !!amenity.shade,
        flatGround: !!amenity.flatGround,
        cellSignal: !!amenity.cellSignal,
        firePit: !!amenity.firePit,
        petFriendly: !!amenity.petFriendly,
        toilet: !!amenity.toilet,
        electricity: !!amenity.electricity,
        wifi: !!amenity.wifi,
      }).onConflictDoNothing();
    } catch (err) {
      console.error(`❌ Error syncing amenities for ID ${amenity.spotId}:`, err);
    }
  }

  console.log('✨ Synchronization complete!');
}

seedRemote().catch(console.error);
