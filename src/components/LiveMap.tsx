"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import React, { useState, useEffect, useCallback } from 'react';
import { Bus } from '@/lib/types';
import { routes } from '@/lib/data';
import { Button } from './ui/button';
import { LocateFixed } from 'lucide-react';

interface LiveMapProps {
  buses: Bus[];
}

const containerStyle = {
  width: '100%',
  height: '600px',
};

const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

function LiveMap({ buses }: LiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<Bus | null>(null);
  const [myLocation, setMyLocation] = useState<google.maps.LatLngLiteral | null>(null);
  
  const centerOnUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMyLocation(userLocation);
          map?.panTo(userLocation);
          map?.setZoom(15);
        },
        () => {
          console.log("Error: The Geolocation service failed.");
          // Optionally, inform the user that location could not be fetched
        }
      );
    } else {
      console.log("Error: Your browser doesn't support geolocation.");
      // Optionally, inform the user
    }
  }, [map]);

  useEffect(() => {
    if (map) {
      centerOnUser();
    }
  }, [map, centerOnUser]);


  const handleMarkerClick = (bus: Bus) => {
    setActiveMarker(bus);
  };

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="flex items-center justify-center h-[600px] bg-muted">Loading Map...</div>;

  return (
    <div className='relative'>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {buses.map((bus) => (
          <Marker
            key={bus.id}
            position={{ lat: bus.lat, lng: bus.lng }}
            onClick={() => handleMarkerClick(bus)}
            icon={{
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: 'hsl(var(--primary))',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#ffffff',
              rotation: 0,
            }}
          />
        ))}

        {myLocation && (
          <Marker
            position={myLocation}
            title="Your Location"
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: 'hsl(var(--accent))',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2
            }}
          />
        )}

        {activeMarker && (
          <InfoWindow
            position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className='p-2'>
              <h3 className="font-bold text-base">Bus {activeMarker.number}</h3>
              <p className="text-sm">Route: {routes.find(r => r.id === activeMarker.routeId)?.number}</p>
              <p className="text-sm capitalize">Status: {activeMarker.status}</p>
              <p className="text-sm">Driver: {activeMarker.driver}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      <Button
        size="icon"
        onClick={centerOnUser}
        className="absolute bottom-4 left-4 z-10"
        aria-label="Center map on my location"
      >
        <LocateFixed className="h-5 w-5" />
      </Button>
    </div>
  );
}

export default React.memo(LiveMap);
