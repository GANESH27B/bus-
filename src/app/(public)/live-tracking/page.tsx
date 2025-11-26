'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { buses, routes } from '@/lib/data';
import type { Stop } from '@/lib/types';
import { LocateFixed } from 'lucide-react';
import LiveMap from '@/components/LiveMap';
import { Button } from '@/components/ui/button';

export default function LiveTrackingPage() {
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);

  const allStops = useMemo(() => {
    const stops: Stop[] = [];
    routes.forEach(route => {
      stops.push(...route.stops);
    });
    // Remove duplicates
    return stops.filter(
      (stop, index, self) => index === self.findIndex(s => s.id === stop.id)
    );
  }, []);

  const centerOnUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(userLocation);
          setMapZoom(15);
        },
        () => {
          console.log('Error: The Geolocation service failed.');
          // Optionally, inform the user that location could not be fetched
        }
      );
    } else {
      console.log("Error: Your browser doesn't support geolocation.");
      // Optionally, inform the user
    }
  }, []);

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-4">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border">
                 <h1 className="text-2xl font-bold font-headline">
                    Live Bus Map
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs">
                    Bus stops are shown as dots. Click the button to center on your location.
                </p>
            </div>
             <Button onClick={centerOnUser} className="w-full shadow-lg">
                <LocateFixed className="mr-2 h-4 w-4" />
                Find Bus Stops Nearby Me
            </Button>
        </div>
      <LiveMap
        buses={buses}
        stops={allStops}
        center={mapCenter}
        zoom={mapZoom}
      />
    </div>
  );
}
