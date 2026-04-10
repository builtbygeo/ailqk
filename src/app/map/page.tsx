import MainMap from '@/components/map/MainMap';
import { getMapSpots } from '@/db/queries';
import { auth } from '@clerk/nextjs/server';

export const runtime = "edge";
export const dynamic = "force-dynamic";

/**
 * Map Page - Shows all locations with detailed filtering.
 * Refined to show user's own pending spots.
 */
export default async function MapPage() {
  const { userId } = await auth();
  const spotsWithAmenities = await getMapSpots(userId);

  return (
    <div className="h-screen w-full relative">
       <MainMap initialLocations={spotsWithAmenities} />
    </div>
  );
}
