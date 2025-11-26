"use client";

import React, { useState, useMemo } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buses, routes } from "@/lib/data";
import type { Bus } from "@/lib/types";
import { Clock, MapPin, Search } from "lucide-react";
import LiveMap from '@/components/LiveMap';

const getEta = (index: number) => `${2 + index * 3} min`;

export default function LiveTrackingPage() {
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("all");

  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      const route = routes.find(r => r.id === bus.routeId);
      const searchLower = searchQuery.toLowerCase();
      const matchesRoute = selectedRoute === "all" || bus.routeId === selectedRoute;
      const matchesSearch = 
        bus.number.toLowerCase().includes(searchLower) ||
        route?.name.toLowerCase().includes(searchLower) ||
        route?.number.toLowerCase().includes(searchLower);
      return matchesRoute && matchesSearch;
    });
  }, [searchQuery, selectedRoute]);

  const EtasList = ({ busesToShow }: { busesToShow: Bus[] }) => (
    <div className="space-y-4">
      {routes.filter(r => selectedRoute === 'all' || selectedRoute === r.id).map(route => {
        const activeBusesOnRoute = busesToShow.filter(b => b.routeId === route.id);
        if (activeBusesOnRoute.length === 0 && selectedRoute !== 'all') return null;

        return (
          <Accordion key={route.id} type="single" collapsible defaultValue={selectedRoute !== 'all' ? `route-${route.id}` : undefined}>
            <AccordionItem value={`route-${route.id}`}>
              <AccordionTrigger className="text-lg font-semibold">Route {route.number}: {route.name}</AccordionTrigger>
              <AccordionContent>
                {route.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div className="flex items-center">
                       <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                       <span>{stop.name}</span>
                    </div>
                    <div className="flex items-center font-medium">
                      <Clock className="h-5 w-5 mr-2 text-accent" />
                      <span>{getEta(index)}</span>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      })}
       {busesToShow.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No active buses found for your search.</p>
        )}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Live Bus Tracking</h1>
          <p className="text-muted-foreground">Watch your bus move in real-time or switch to a list view.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="low-bandwidth-mode" checked={isLowBandwidth} onCheckedChange={setIsLowBandwidth} />
          <Label htmlFor="low-bandwidth-mode">Low Bandwidth Mode</Label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit sticky top-20">
          <CardHeader>
            <CardTitle>Find Your Bus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search bus or route..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger>
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.number} - {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {isLowBandwidth ? (
            <Card>
              <CardHeader>
                <CardTitle>Estimated Arrival Times (ETAs)</CardTitle>
              </CardHeader>
              <CardContent>
                <EtasList busesToShow={filteredBuses} />
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden">
                <CardContent className="p-0">
                    <LiveMap buses={filteredBuses} />
                </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
