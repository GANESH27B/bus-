"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import React, { useState, useEffect } from 'react';
import { Bus } from '@/lib/types';
import { routes } from '@/lib/data';

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

  const [activeMarker, setActiveMarker] = useState<Bus | null>(null);
  const [myLocation, setMyLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMyLocation(userLocation);
          setMapCenter(userLocation); // Center map on user's location
        },
        () => {
          console.log("Error: The Geolocation service failed.");
        }
      );
    } else {
      console.log("Error: Your browser doesn't support geolocation.");
    }
  }, []);

  const handleMarkerClick = (bus: Bus) => {
    setActiveMarker(bus);
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-[600px] bg-muted">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={13}
      options={mapOptions}
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
  );
}

export default React.memo(LiveMap);
