import { db } from './index';
import { spots, amenities } from './schema';
import { eq, or, and } from 'drizzle-orm';

export interface SpotWithAmenities {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  type: 'wild' | 'host';
  region: string;
  imageUrl: string | null;
  averageRating: number | null;
  reviewsCount: number | null;
  status: 'pending' | 'approved' | 'rejected' | null;
  legalStatus: 'tolerated' | 'approved' | 'protected' | 'strict' | null;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme' | null;
  createdAt: Date | null;
  createdBy: string | null;
  amenities: {
    water: boolean;
    shade: boolean;
    flatGround: boolean;
    cellSignal: boolean;
    firePit: boolean;
    petFriendly: boolean;
    toilet: boolean;
    electricity: boolean;
    wifi: boolean;
  } | null;
}

/**
 * Fetch all approved spots with amenities in a single LEFT JOIN query.
 * Replaces the N+1 pattern (one query per spot).
 */
export async function getApprovedSpotsWithAmenities(): Promise<SpotWithAmenities[]> {
  const rows = await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      latitude: spots.latitude,
      longitude: spots.longitude,
      type: spots.type,
      region: spots.region,
      imageUrl: spots.imageUrl,
      averageRating: spots.averageRating,
      reviewsCount: spots.reviewsCount,
      status: spots.status,
      legalStatus: spots.legalStatus,
      riskLevel: spots.riskLevel,
      createdAt: spots.createdAt,
      createdBy: spots.createdBy,
      amenityWater: amenities.water,
      amenityShade: amenities.shade,
      amenityFlatGround: amenities.flatGround,
      amenityCellSignal: amenities.cellSignal,
      amenityFirePit: amenities.firePit,
      amenityPetFriendly: amenities.petFriendly,
      amenityToilet: amenities.toilet,
      amenityElectricity: amenities.electricity,
      amenityWifi: amenities.wifi,
    })
    .from(spots)
    .leftJoin(amenities, eq(amenities.spotId, spots.id))
    .where(eq(spots.status, 'approved'));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.type,
    region: row.region,
    imageUrl: row.imageUrl,
    averageRating: row.averageRating,
    reviewsCount: row.reviewsCount,
    status: row.status,
    legalStatus: row.legalStatus,
    riskLevel: row.riskLevel,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    amenities: row.amenityWater !== null || row.amenityShade !== null
      ? {
          water: !!row.amenityWater,
          shade: !!row.amenityShade,
          flatGround: !!row.amenityFlatGround,
          cellSignal: !!row.amenityCellSignal,
          firePit: !!row.amenityFirePit,
          petFriendly: !!row.amenityPetFriendly,
          toilet: !!row.amenityToilet,
          electricity: !!row.amenityElectricity,
          wifi: !!row.amenityWifi,
        }
      : null,
  }));
}

/**
 * Fetch spots for the map:
 * 1. All Approved spots
 * 2. Pending spots created by the current user (if logged in)
 */
export async function getMapSpots(userId?: string | null): Promise<SpotWithAmenities[]> {
  const whereClause = userId 
    ? or(eq(spots.status, 'approved'), and(eq(spots.status, 'pending'), eq(spots.createdBy, userId)))
    : eq(spots.status, 'approved');

  const rows = await db
    .select({
      id: spots.id,
      name: spots.name,
      description: spots.description,
      latitude: spots.latitude,
      longitude: spots.longitude,
      type: spots.type,
      region: spots.region,
      imageUrl: spots.imageUrl,
      averageRating: spots.averageRating,
      reviewsCount: spots.reviewsCount,
      status: spots.status,
      legalStatus: spots.legalStatus,
      riskLevel: spots.riskLevel,
      createdAt: spots.createdAt,
      createdBy: spots.createdBy,
      amenityWater: amenities.water,
      amenityShade: amenities.shade,
      amenityFlatGround: amenities.flatGround,
      amenityCellSignal: amenities.cellSignal,
      amenityFirePit: amenities.firePit,
      amenityPetFriendly: amenities.petFriendly,
      amenityToilet: amenities.toilet,
      amenityElectricity: amenities.electricity,
      amenityWifi: amenities.wifi,
    })
    .from(spots)
    .leftJoin(amenities, eq(amenities.spotId, spots.id))
    .where(whereClause);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    latitude: row.latitude,
    longitude: row.longitude,
    type: row.type,
    region: row.region,
    imageUrl: row.imageUrl,
    averageRating: row.averageRating,
    reviewsCount: row.reviewsCount,
    status: row.status,
    legalStatus: row.legalStatus,
    riskLevel: row.riskLevel,
    createdAt: row.createdAt,
    createdBy: row.createdBy,
    amenities: row.amenityWater !== null || row.amenityShade !== null
      ? {
          water: !!row.amenityWater,
          shade: !!row.amenityShade,
          flatGround: !!row.amenityFlatGround,
          cellSignal: !!row.amenityCellSignal,
          firePit: !!row.amenityFirePit,
          petFriendly: !!row.amenityPetFriendly,
          toilet: !!row.amenityToilet,
          electricity: !!row.amenityElectricity,
          wifi: !!row.amenityWifi,
        }
      : null,
  }));
}
