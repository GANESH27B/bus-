
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LiveMap from '@/components/LiveMap';
import { routes } from '@/lib/data';
import type { Stop } from '@/lib/types';

export default function NearbyStopsPage() {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allStops, setAllStops] = useState<Stop[]>([]);

  const findUserLocation = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setUserLocation({
            lat: latitude,
            lng: longitude,
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
    const stops = routes.flatMap(route => route.stops);
    setAllStops(stops);
    findUserLocation();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">Find Nearby Stops</h1>
            <p className="text-muted-foreground">Explore bus stops near your current location.</p>
        </div>
        <Button onClick={findUserLocation} className="shadow-lg" disabled={loading}>
            <Compass className="mr-2 h-4 w-4" />
            Find Stops Nearby
        </Button>
      </div>

      <Card className="h-[65vh] w-full overflow-hidden">
        <CardContent className="p-0 h-full w-full relative">
            {(loading) && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Finding your location...</p>
            </div>
            )}
            {error && !loading && (
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
        </CardContent>
      </Card>
    </div>
  );
}
