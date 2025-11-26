'use client';

import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import React, { useState, useEffect, useCallback } from 'react';
import type { Bus, Stop } from '@/lib/types';
import { routes } from '@/lib/data';
import { Button } from './ui/button';
import { LocateFixed } from 'lucide-react';

interface LiveMapProps {
  buses: Bus[];
  stops: Stop[];
  center?: google.maps.LatLngLiteral | null;
  zoom?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
        "featureType": "poi",
        "stylers": [
            { "visibility": "off" }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            { "visibility": "off" }
        ]
    }
  ]
};

function LiveMap({ buses, stops, center, zoom }: LiveMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeMarker, setActiveMarker] = useState<Bus | Stop | null>(null);
  const [myLocation, setMyLocation] = useState<google.maps.LatLngLiteral | null>(null);

  const centerOnUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMyLocation(userLocation);
          map?.panTo(userLocation);
          map?.setZoom(15);
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
  }, [map]);

  useEffect(() => {
    if (map && center) {
        map.panTo(center);
        if (zoom) {
            map.setZoom(zoom);
        }
    }
  }, [map, center, zoom]);


  const handleMarkerClick = (marker: Bus | Stop) => {
    setActiveMarker(marker);
  };

  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
    centerOnUser();
  }, [centerOnUser]);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!isLoaded)
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        Loading Map...
      </div>
    );

  return (
    <div className="relative h-full w-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || defaultCenter}
        zoom={zoom || 12}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Bus Markers */}
        {buses.map(bus => (
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
              strokeColor: 'hsl(var(--primary-foreground))',
              rotation: 0,
            }}
            zIndex={100}
          />
        ))}

        {/* Stop Markers */}
        {stops.map(stop => (
          <Marker
            key={stop.id}
            position={{ lat: stop.lat, lng: stop.lng }}
            onClick={() => handleMarkerClick(stop)}
            icon={{
              path: 'M-10,0a10,10 0 1,0 20,0a10,10 0 1,0 -20,0',
              fillColor: 'hsl(var(--secondary))',
              fillOpacity: 0.8,
              strokeColor: 'hsl(var(--secondary-foreground))',
              strokeWeight: 1,
              scale: 0.6,
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
              fillColor: 'hsl(var(--ring))',
              fillOpacity: 1,
              strokeColor: 'hsl(var(--background))',
              strokeWeight: 2,
            }}
          />
        )}

        {activeMarker && (
          <InfoWindow
            position={{ lat: activeMarker.lat, lng: activeMarker.lng }}
            onCloseClick={() => setActiveMarker(null)}
          >
            <div className="p-2">
              {'number' in activeMarker ? (
                <>
                  <h3 className="font-bold text-base">Bus {activeMarker.number}</h3>
                  <p className="text-sm">
                    Route:{' '}
                    {routes.find(r => r.id === activeMarker.routeId)?.number}
                  </p>
                  <p className="text-sm capitalize">Status: {activeMarker.status}</p>
                  <p className="text-sm">Driver: {activeMarker.driver}</p>
                </>
              ) : (
                <h3 className="font-bold text-base">{activeMarker.name}</h3>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export default React.memo(LiveMap);
