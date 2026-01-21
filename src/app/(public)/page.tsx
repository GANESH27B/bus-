
'use client';

import { useState, useEffect } from 'react';
import LiveMap from '@/components/LiveMap';
import { routes } from '@/lib/data';
import type { Stop } from '@/lib/types';
import { Loader2, MapPin } from 'lucide-react';

function getDistance(p1: {lat: number, lng: number}, p2: {lat: number, lng: number}) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // Distance in km
}

export default function HomePage() {
  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [nearbyStops, setNearbyStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Finding your location...");

  useEffect(() => {
    const allStops = routes.flatMap(route => route.stops);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          
          setStatusMessage("Finding nearby stops...");
          const stops = allStops.filter(stop => {
              const distance = getDistance(location, {lat: stop.lat, lng: stop.lng});
              return distance <= 5;
          });
          setNearbyStops(stops);
          
          if(stops.length === 0) {
            setStatusMessage("No bus stops found within 5 km of your location.");
          }

          setLoading(false);
        },
        () => {
          console.error("Error getting user location.");
          setStatusMessage("Could not access your location. Please enable location services. Showing all stops as a fallback.");
          setNearbyStops(allStops); // Show all stops as a fallback
          setLoading(false);
        }
      );
    } else {
        setStatusMessage("Geolocation is not supported by your browser. Showing all stops as a fallback.");
        setNearbyStops(allStops); // Show all stops as a fallback
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
        {nearbyStops.length > 0 ? (
             <LiveMap 
                buses={[]} 
                stops={nearbyStops}
                userLocation={userLocation}
                center={userLocation}
                zoom={14}
            />
        ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <MapPin className="w-12 h-12 mb-4" />
                <p className='max-w-md'>{statusMessage}</p>
            </div>
        )}
       <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-md max-w-sm w-[calc(100%-2rem)]">
            <h1 className="text-lg font-bold font-headline text-center">Nearby Bus Stops</h1>
            <p className="text-muted-foreground text-center text-xs">Showing stops within 5 km of your location.</p>
        </div>
    </div>
  );
}
