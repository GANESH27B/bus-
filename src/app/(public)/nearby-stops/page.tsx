'use client';

import { useEffect, useState } from 'react';
import LiveMap from '@/components/LiveMap';
import { routes } from '@/lib/data';
import type { Stop } from '@/lib/types';
import { Loader2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NearbyStopsPage() {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allStops: Stop[] = routes.flatMap(route => route.stops);

  const findUserLocation = () => {
    setLoading(true);
    setError(null);
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
          setError('Unable to retrieve your location. Please enable location services in your browser.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  useEffect(() => {
    findUserLocation();
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Finding your location...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm text-center p-4">
          <Compass className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive font-semibold">{error}</p>
          <Button onClick={findUserLocation} className="mt-4">Try Again</Button>
        </div>
      )}
      <LiveMap 
        buses={[]} 
        stops={allStops} 
        userLocation={userLocation}
        center={userLocation}
        zoom={15}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
         <Button onClick={findUserLocation} className="shadow-lg" disabled={loading}>
            <Compass className="mr-2 h-4 w-4" />
            Find Bus Stops Nearby
        </Button>
      </div>
    </div>
  );
}
