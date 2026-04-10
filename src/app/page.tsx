import MainMap from '@/components/map/MainMap';
import { getMapSpots } from '@/db/queries';
import { auth } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();
  const spotsWithAmenities = await getMapSpots(userId);
  return <MainMap initialLocations={spotsWithAmenities} />;
}
