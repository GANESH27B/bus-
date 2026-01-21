
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { getAvailableServices, trackByServiceNumber, trackByVehicleNumber } from './actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Search, Bus, CalendarIcon, FileDown, Ticket, PersonStanding, TramFront, Clock, Milestone } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import LiveMap from '@/components/LiveMap';
import type { Bus as BusType } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const searchSchema = z.object({
  from: z.string().min(3, { message: 'Please enter a valid location.' }),
  to: z.string().min(3, { message: 'Please enter a valid location.' }),
  date: z.date({
    required_error: "A date is required.",
  }),
});

const trackServiceSchema = z.object({
    serviceNumber: z.string().min(3, { message: 'Please enter a valid service number.' }),
});

const trackVehicleSchema = z.object({
    vehicleNumber: z.string().min(3, { message: 'Please enter a valid vehicle number.' }),
});

type Step = {
    instruction: string;
    travelMode: string;
    duration: string;
    distance: string;
};

type Service = {
    duration: string;
    distance: string;
    steps: Step[];
};

function formatDuration(isoDuration: string) {
    const seconds = parseInt(isoDuration.replace('s', ''), 10);
    if (isNaN(seconds)) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
}


export default function RoutesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any | null>(null);
  
  const fromAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const toAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: '',
      to: '',
      date: new Date(),
    },
  });

  const trackServiceForm = useForm<z.infer<typeof trackServiceSchema>>({
    resolver: zodResolver(trackServiceSchema),
    defaultValues: { serviceNumber: "" },
  });

  const trackVehicleForm = useForm<z.infer<typeof trackVehicleSchema>>({
    resolver: zodResolver(trackVehicleSchema),
    defaultValues: { vehicleNumber: "" },
  });

  const clearState = () => {
    setIsLoading(true);
    setError(null);
    setServices(null);
    setSearched(true);
    setTrackingResult(null);
  }

  async function onSearchSubmit(values: z.infer<typeof searchSchema>) {
    clearState();
    
    const formattedValues = {
        ...values,
        date: values.date.toISOString(),
    }

    const result = await getAvailableServices(formattedValues);

    if (result.success && result.data) {
      setServices(result.data);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setIsLoading(false);
  }

  async function onTrackServiceSubmit(values: z.infer<typeof trackServiceSchema>) {
    clearState();
    const result = await trackByServiceNumber(values.serviceNumber);
    if (result.success) {
      setTrackingResult(result.data);
    } else {
      setError(result.error || 'Could not track service.');
    }
    setIsLoading(false);
  }

  async function onTrackVehicleSubmit(values: z.infer<typeof trackVehicleSchema>) {
    clearState();
    const result = await trackByVehicleNumber(values.vehicleNumber);
     if (result.success) {
      setTrackingResult(result.data);
    } else {
      setError(result.error || 'Could not track vehicle.');
    }
    setIsLoading(false);
  }

  const exportToExcel = () => {
    if (!services) return;
    const worksheet = XLSX.utils.json_to_sheet(services.flatMap((s, i) => ([{ 'Route Option': i+1, 'Total Duration': formatDuration(s.duration), 'Total Distance': s.distance }, ...s.steps.map(step => ({ Instruction: step.instruction, Mode: step.travelMode, 'Step Duration': formatDuration(step.duration), 'Step Distance': step.distance }))])));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bus Services");
    XLSX.writeFile(workbook, "Bus_Route_Options.xlsx");
  };
  
    const StepIcon = ({ travelMode }: { travelMode: string }) => {
        if (travelMode === 'WALK') {
            return <PersonStanding className="h-5 w-5 text-muted-foreground" />;
        }
        if (travelMode === 'TRANSIT') {
            return <Bus className="h-5 w-5 text-muted-foreground" />;
        }
        return <TramFront className="h-5 w-5 text-muted-foreground" />;
    };

  if (!isLoaded) {
    return <div className="container mx-auto py-8 px-4 md:px-6 flex justify-center items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          Services & Live Tracking
        </h1>
        <p className="text-muted-foreground">
          Search for transit routes and track buses in real-time.
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full" onValueChange={() => { setTrackingResult(null); setError(null); setSearched(false); setServices(null)}}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search"><Search className="mr-2 h-4 w-4"/>Search Routes</TabsTrigger>
          <TabsTrigger value="track-service"><Ticket className="mr-2 h-4 w-4"/>Track by Service</TabsTrigger>
          <TabsTrigger value="track-vehicle"><Bus className="mr-2 h-4 w-4"/>Track by Vehicle</TabsTrigger>
        </TabsList>

        {/* SEARCH BUSES TAB */}
        <TabsContent value="search">
            <Card className="mb-8">
                <CardHeader>
                <CardTitle>Search for Transit Routes</CardTitle>
                </CardHeader>
                <CardContent>
                <Form {...searchForm}>
                    <form
                    onSubmit={searchForm.handleSubmit(onSearchSubmit)}
                    className="grid sm:grid-cols-3 gap-4"
                    >
                    <FormField
                        control={searchForm.control}
                        name="from"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>From</FormLabel>
                             <FormControl>
                                <Autocomplete
                                    onLoad={(autocomplete) => {
                                        fromAutocompleteRef.current = autocomplete;
                                    }}
                                    onPlaceChanged={() => {
                                        const place = fromAutocompleteRef.current?.getPlace();
                                        if (place?.formatted_address) {
                                            searchForm.setValue('from', place.formatted_address);
                                        }
                                    }}
                                >
                                <Input placeholder="e.g., Majestic Bus Stand, Bangalore" {...field} />
                                </Autocomplete>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={searchForm.control}
                        name="to"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>To</FormLabel>
                            <FormControl>
                               <Autocomplete
                                    onLoad={(autocomplete) => {
                                       toAutocompleteRef.current = autocomplete;
                                    }}
                                    onPlaceChanged={() => {
                                        const place = toAutocompleteRef.current?.getPlace();
                                        if (place?.formatted_address) {
                                            searchForm.setValue('to', place.formatted_address);
                                        }
                                    }}
                                >
                                <Input placeholder="e.g., Chennai Central Railway Station" {...field} />
                                </Autocomplete>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={searchForm.control}
                        name="date"
                        render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Departure Date</FormLabel>
                            <Popover>
                            <PopoverTrigger asChild>
                                <FormControl>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                    )}
                                >
                                    {field.value ? (
                                    format(field.value, "PPP")
                                    ) : (
                                    <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                                </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                    date < new Date(new Date().setHours(0,0,0,0))
                                }
                                initialFocus
                                />
                            </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="sm:col-span-3">
                        <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                            </>
                        ) : (
                            <>
                            <Search className="mr-2 h-4 w-4" />
                            Find Routes
                            </>
                        )}
                        </Button>
                    </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>Available Routes</CardTitle>
                        <CardDescription>
                            List of route options based on your search.
                        </CardDescription>
                    </div>
                    {services && services.length > 0 && (
                        <Button onClick={exportToExcel} variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export to Excel
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                {isLoading && (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                    <p>Loading transit data...</p>
                    </div>
                )}
                {error && <p className="text-destructive text-center py-16">{error}</p>}
                {!isLoading && !error && services && services.length > 0 && (
                    <Accordion type="single" collapsible className="w-full">
                        {services.map((service, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>
                                    <div className='flex justify-between w-full pr-4'>
                                        <span>Route Option {index + 1}</span>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> {formatDuration(service.duration)}</span>
                                            <span className="flex items-center"><Milestone className="mr-1 h-4 w-4" /> {service.distance}</span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[100px]">Mode</TableHead>
                                                <TableHead>Instruction</TableHead>
                                                <TableHead>Duration</TableHead>
                                                <TableHead className="text-right">Distance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {service.steps.map((step, stepIndex) => (
                                                <TableRow key={stepIndex}>
                                                    <TableCell><StepIcon travelMode={step.travelMode} /></TableCell>
                                                    <TableCell className="font-medium">{step.instruction}</TableCell>
                                                    <TableCell>{formatDuration(step.duration)}</TableCell>
                                                    <TableCell className="text-right">{step.distance}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
                {!isLoading && searched && services?.length === 0 && !trackingResult && (
                    <div className="text-center text-muted-foreground py-16">
                        <Bus className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">No routes found.</p>
                        <p>There are no bus routes available for the selected origin and destination.</p>
                    </div>
                )}
                {!isLoading && !searched && !error && (
                    <div className="text-center text-muted-foreground py-16">
                        <Search className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">Your search results will appear here.</p>
                        <p>Fill out the form to find available routes.</p>
                    </div>
                )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* TRACK BY SERVICE TAB */}
        <TabsContent value="track-service">
            <Card>
                <CardHeader>
                    <CardTitle>Track by Reservation Service Number</CardTitle>
                    <CardDescription>Enter the service number from your reservation to get its live status.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...trackServiceForm}>
                        <form onSubmit={trackServiceForm.handleSubmit(onTrackServiceSubmit)} className="flex items-start gap-4 mb-8">
                             <FormField
                                control={trackServiceForm.control}
                                name="serviceNumber"
                                render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormLabel className="sr-only">Service Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter reservation service number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-48">
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tracking...</> : <><Search className="mr-2 h-4 w-4" /> Track Bus</>}
                            </Button>
                        </form>
                    </Form>
                    
                    {isLoading && (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                            <p>Getting live status...</p>
                        </div>
                    )}
                    {error && <p className="text-destructive text-center py-16">{error}</p>}
                    {trackingResult && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tracking Result for Service #{trackingResult.id}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><strong>Status:</strong> {trackingResult.status}</p>
                                    <p><strong>Current Location:</strong> {trackingResult.location}</p>
                                    <p><strong>ETA to Destination:</strong> {trackingResult.eta}</p>
                                </CardContent>
                            </Card>
                             <Card className="overflow-hidden h-64">
                                <CardContent className="p-0 h-full">
                                    <LiveMap buses={[trackingResult as BusType]} center={{lat: trackingResult.lat, lng: trackingResult.lng }} zoom={14} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                     {!isLoading && !searched && !error && !trackingResult && (
                        <div className="text-center text-muted-foreground py-16">
                            <Search className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-lg font-medium">Your tracking results will appear here.</p>
                            <p>Enter a service number to track a bus.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>

        {/* TRACK BY VEHICLE TAB */}
        <TabsContent value="track-vehicle">
            <Card>
                 <CardHeader>
                    <CardTitle>Track by Vehicle Number</CardTitle>
                    <CardDescription>Enter the bus's registration number (e.g., KA-01-F-1234) to see its location.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...trackVehicleForm}>
                        <form onSubmit={trackVehicleForm.handleSubmit(onTrackVehicleSubmit)} className="flex items-start gap-4 mb-8">
                             <FormField
                                control={trackVehicleForm.control}
                                name="vehicleNumber"
                                render={({ field }) => (
                                <FormItem className="flex-grow">
                                    <FormLabel className="sr-only">Vehicle Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter bus registration number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-48">
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Tracking...</> : <><Search className="mr-2 h-4 w-4" /> Track Bus</>}
                            </Button>
                        </form>
                    </Form>

                    {isLoading && (
                        <div className="flex items-center justify-center py-16 text-muted-foreground">
                            <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                            <p>Getting live status...</p>
                        </div>
                    )}
                    {error && <p className="text-destructive text-center py-16">{error}</p>}
                    {trackingResult && (
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Tracking Result for Vehicle #{trackingResult.id}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <p><strong>Status:</strong> {trackingResult.status}</p>
                                    <p><strong>Current Location:</strong> {trackingResult.location}</p>
                                    <p><strong>Route:</strong> {trackingResult.route}</p>
                                </CardContent>
                            </Card>
                            <Card className="overflow-hidden h-64">
                                <CardContent className="p-0 h-full">
                                    <LiveMap buses={[trackingResult as BusType]} center={{lat: trackingResult.lat, lng: trackingResult.lng }} zoom={14} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {!isLoading && !searched && !error && !trackingResult && (
                        <div className="text-center text-muted-foreground py-16">
                            <Search className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-lg font-medium">Your tracking results will appear here.</p>
                            <p>Enter a vehicle number to track a bus.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    

    