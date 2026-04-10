import MainMap from '@/components/map/MainMap';
import { getApprovedSpotsWithAmenities } from '@/db/queries';

export default async function MapPage() {
  const spotsWithAmenities = await getApprovedSpotsWithAmenities();
  return <MainMap initialLocations={spotsWithAmenities} />;
}
