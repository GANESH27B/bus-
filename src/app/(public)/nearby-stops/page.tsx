
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NearbyStopsPage() {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

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
          setMapUrl(`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=bus+stops+near+me&center=${latitude},${longitude}&zoom=15`);
          setLoading(false);
        },
        () => {
          setError('Unable to retrieve your location. Please enable location services in your browser.');
          setMapUrl(`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=bus+stops`);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setMapUrl(`https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=bus+stops`);
      setLoading(false);
    }
  };

  useEffect(() => {
    findUserLocation();
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full flex flex-col">
      <div className="bg-background p-4 border-b flex items-center justify-between gap-4">
        <div>
            <h1 className="text-xl font-bold font-headline">Find Nearby Stops</h1>
            <p className="text-muted-foreground text-sm">Explore bus stops near your current location.</p>
        </div>
        <Button onClick={findUserLocation} className="shadow-lg" disabled={loading}>
            <Compass className="mr-2 h-4 w-4" />
            Find Stops Nearby
        </Button>
      </div>

      <div className="flex-grow relative">
        {loading && (
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
        {mapUrl && !loading && (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          ></iframe>
        )}
      </div>
    </div>
  );
}
