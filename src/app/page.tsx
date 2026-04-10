import MainMap from '@/components/map/MainMap';
import { getApprovedSpotsWithAmenities } from '@/db/queries';

export default async function Home() {
  const spotsWithAmenities = await getApprovedSpotsWithAmenities();
  return <MainMap initialLocations={spotsWithAmenities} />;
}
