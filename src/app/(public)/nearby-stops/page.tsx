
'use client';

import React, { useState, useEffect } from 'react';
import LiveMap from '@/components/LiveMap';
import { routes } from '@/lib/data';
import type { Stop } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function NearbyStopsPage() {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allStops = React.useMemo(() => {
    const stopsSet = new Map<string, Stop>();
    routes.forEach(route => {
        route.stops.forEach(stop => {
            if (!stopsSet.has(stop.id)) {
                stopsSet.set(stop.id, stop);
            }
        });
    });
    return Array.from(stopsSet.values());
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setError("Could not get your location. Please enable location services in your browser.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col flex-1 items-center justify-center bg-muted text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin mb-4" />
        <p>Finding your location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col flex-1 items-center justify-center bg-destructive/10 text-destructive-foreground p-4 text-center">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
        <LiveMap 
            stops={allStops}
            userLocation={userLocation}
            center={userLocation}
            zoom={15}
            buses={[]}
        />
    </div>
  );
}
