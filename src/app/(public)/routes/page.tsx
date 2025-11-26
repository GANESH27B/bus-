import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/lib/data";
import { Clock, MapPin, Route as RouteIcon } from "lucide-react";

const getScheduleTimings = (routeId: string) => {
  const baseTime = 6;
  const timings = [];
  for (let i = 0; i < 12; i++) {
    const hour = (baseTime + i).toString().padStart(2, '0');
    timings.push(`${hour}:00`, `${hour}:30`);
  }
  return timings;
}

export default function RoutesPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Routes & Schedules</h1>
        <p className="text-muted-foreground">
          Browse all available routes, their stops, and operating schedules.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Accordion type="single" collapsible className="w-full">
            {routes.map((route, index) => (
              <AccordionItem value={`item-${index}`} key={route.id}>
                <AccordionTrigger className="p-6 hover:no-underline">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <RouteIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-left">
                        {route.name}
                      </h3>
                      <p className="text-sm text-muted-foreground text-left">
                        Route {route.number}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="bg-secondary/50">
                  <div className="grid md:grid-cols-2 gap-px bg-border">
                    <div className="bg-card p-6">
                      <h4 className="font-semibold mb-4 text-lg flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-accent" />
                        Stops
                      </h4>
                      <ul className="space-y-3">
                        {route.stops.map((stop, stopIndex) => (
                          <li key={stop.id} className="flex items-center text-muted-foreground">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs mr-3">
                              {stopIndex + 1}
                            </span>
                            {stop.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-card p-6">
                      <h4 className="font-semibold mb-4 text-lg flex items-center">
                        <Clock className="mr-2 h-5 w-5 text-accent" />
                        Schedule
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Buses run approximately at these times from the first stop.
                      </p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {getScheduleTimings(route.id).map(time => (
                          <div key={time} className="text-center bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-sm">
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
