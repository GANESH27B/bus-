
'use client';

import { useState, useEffect } from 'react';
import LiveMap from '@/components/LiveMap';
import { routes } from '@/lib/data';
import type { Stop } from '@/lib/types';
import { Loader2, MapPin } from 'lucide-react';

export default function NearbyStopsPage() {
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [allStops, setAllStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Finding your location...");

  useEffect(() => {
    const stops = routes.flatMap(route => route.stops);
    setAllStops(stops);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setStatusMessage("Showing all available bus stops.");
          setLoading(false);
        },
        () => {
          console.error("Error getting user location.");
          setStatusMessage("Could not access your location. Please enable location services. Showing all stops as a fallback.");
          setLoading(false);
        }
      );
    } else {
        setStatusMessage("Geolocation is not supported by your browser. Showing all stops as a fallback.");
        setLoading(false);
    }
  }, []);

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-muted-foreground">
            <Loader2 className="mr-3 h-8 w-8 animate-spin" />
            <p>{statusMessage}</p>
        </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative">
        <h1 className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md text-lg font-bold font-headline text-center">Live Bus Map</h1>
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
