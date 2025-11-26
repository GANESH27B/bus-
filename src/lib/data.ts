import type { Bus, Route } from './types';

export const routes: Route[] = [
  {
    id: 'route-1',
    name: 'Downtown Express',
    number: '101',
    stops: [
      { id: 'stop-1-1', name: 'Central Station', lat: 34.0522, lng: -118.2437 },
      { id: 'stop-1-2', name: 'Grand Park', lat: 34.056, lng: -118.242 },
      { id: 'stop-1-3', name: 'Museum of Modern Art', lat: 34.062, lng: -118.238 },
      { id: 'stop-1-4', name: 'City Hall', lat: 34.053, lng: -118.244 },
    ],
  },
  {
    id: 'route-2',
    name: 'Crosstown Connector',
    number: '202',
    stops: [
      { id: 'stop-2-1', name: 'Westside Mall', lat: 34.04, lng: -118.26 },
      { id: 'stop-2-2', name: 'University Campus', lat: 34.03, lng: -118.27 },
      { id: 'stop-2-3', name: 'Medical Center', lat: 34.02, lng: -118.28 },
      { id: 'stop-2-4', name: 'Eastside Plaza', lat: 34.01, lng: -118.29 },
    ],
  },
  {
    id: 'route-3',
    name: 'Suburb Shuttle',
    number: '303',
    stops: [
      { id: 'stop-3-1', name: 'Northwood Heights', lat: 34.07, lng: -118.22 },
      { id: 'stop-3-2', name: 'Community College', lat: 34.075, lng: -118.21 },
      { id: 'stop-3-3', name: 'Library', lat: 34.08, lng: -118.20 },
      { id: 'stop-3-4', name: 'Southwood Park', lat: 34.085, lng: -118.19 },
    ],
  },
];

export const buses: Bus[] = [
  {
    id: 'bus-1',
    number: 'B-1011',
    routeId: 'route-1',
    lat: 34.054,
    lng: -118.243,
    status: 'active',
    driver: 'John Doe',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bus-2',
    number: 'B-1012',
    routeId: 'route-1',
    lat: 34.06,
    lng: -118.239,
    status: 'delayed',
    driver: 'Jane Smith',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bus-3',
    number: 'B-2021',
    routeId: 'route-2',
    lat: 34.035,
    lng: -118.265,
    status: 'active',
    driver: 'Mike Ross',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'bus-4',
    number: 'B-3031',
    routeId: 'route-3',
    lat: 34.078,
    lng: -118.205,
    status: 'idle',
    driver: 'Rachel Zane',
    lastUpdated: new Date().toISOString(),
  },
    {
    id: 'bus-5',
    number: 'B-2022',
    routeId: 'route-2',
    lat: 34.015,
    lng: -118.285,
    status: 'maintenance',
    driver: 'Harvey Specter',
    lastUpdated: new Date().toISOString(),
  },
];

export const getRouteById = (id: string) => routes.find(r => r.id === id);
export const getBusById = (id: string) => buses.find(b => b.id === id);
