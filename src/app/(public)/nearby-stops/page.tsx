
'use client';

import { useState, useEffect } from 'react';
import LiveMap from '@/components/LiveMap';
import { routes } from '@/lib/data';
import type { Stop } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function NearbyStopsPage() {
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Flatten all stops from all routes into a single array
    const stops = routes.flatMap(route => route.stops);
    setAllStops(stops);
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        () => {
          // Handle error or permission denied
          console.error("Error getting user location.");
          setLoading(false); // Still show map, centered by default
        }
      );
    } else {
        setLoading(false);
    }
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Loader2 className="mr-3 h-8 w-8 animate-spin" />
            <p>Finding your location...</p>
        </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
        <LiveMap 
            buses={[]} 
            stops={allStops}
            userLocation={userLocation}
            center={userLocation}
            zoom={14}
        />
    </div>
  );
}
