'use client';

import { useState } from 'react';
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
import { Loader2, Search, Bus, CalendarIcon, FileDown, Ticket, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import LiveMap from '@/components/LiveMap';
import type { Bus as BusType } from '@/lib/types';


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

type Service = {
  serviceName: string;
  serviceId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  seatsAvailable: string;
};

export default function RoutesPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any | null>(null);

  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      from: 'VIJAYAWADA',
      to: 'HYDERABAD',
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
        date: format(values.date, "dd/MM/yyyy"),
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
    const worksheet = XLSX.utils.json_to_sheet(services);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bus Services");
    XLSX.writeFile(workbook, "APSRTC_Bus_Services.xlsx");
  };

  const FeatureCard = ({ icon, title, description, href, action }: { icon: React.ReactNode, title: string, description: string, href?: string, action?: () => void }) => {
    const content = (
        <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="mx-auto bg-muted p-4 rounded-full w-fit">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <CardTitle className="text-lg mb-2">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return <button onClick={action} className="w-full h-full">{content}</button>;
  }


  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          Services & Live Tracking
        </h1>
        <p className="text-muted-foreground">
          Search, track, and manage your bus journey.
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full" onValueChange={() => { setTrackingResult(null); setError(null); setSearched(false); setServices(null)}}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search"><Search className="mr-2 h-4 w-4"/>Search Buses</TabsTrigger>
          <TabsTrigger value="track-service"><Ticket className="mr-2 h-4 w-4"/>Track by Service</TabsTrigger>
          <TabsTrigger value="track-vehicle"><Bus className="mr-2 h-4 w-4"/>Track by Vehicle</TabsTrigger>
          <TabsTrigger value="nearby-stops" asChild><Link href="/live-tracking" className="flex items-center justify-center"><MapPin className="mr-2 h-4 w-4"/>Nearby Stops</Link></TabsTrigger>
        </TabsList>

        {/* SEARCH BUSES TAB */}
        <TabsContent value="search">
            <Card className="mb-8">
                <CardHeader>
                <CardTitle>Search for Services</CardTitle>
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
                            <Input placeholder="e.g., VIJAYAWADA" {...field} />
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
                            <Input placeholder="e.g., HYDERABAD" {...field} />
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
                            <FormLabel>Date</FormLabel>
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
                            Find Buses
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
                        <CardTitle>Available Services</CardTitle>
                        <CardDescription>
                            List of services based on your search criteria.
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
                    <p>Loading live bus data...</p>
                    </div>
                )}
                {error && <p className="text-destructive text-center py-16">{error}</p>}
                {!isLoading && !error && services && (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Departs</TableHead>
                        <TableHead>Arrives</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="text-right">Seats</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service) => (
                        <TableRow key={service.serviceId}>
                            <TableCell className="font-medium">
                            {service.serviceName}
                            </TableCell>
                            <TableCell>{service.departureTime}</TableCell>
                            <TableCell>{service.arrivalTime}</TableCell>
                            <TableCell>{service.duration}</TableCell>
                            <TableCell className="text-right">
                            {service.seatsAvailable}
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                )}
                {!isLoading && searched && services?.length === 0 && !trackingResult && (
                    <div className="text-center text-muted-foreground py-16">
                        <Bus className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">No services found.</p>
                        <p>There are no buses available for the selected route and date.</p>
                    </div>
                )}
                {!isLoading && !searched && !error && (
                    <div className="text-center text-muted-foreground py-16">
                        <Search className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">Your search results will appear here.</p>
                        <p>Fill out the form to find available buses.</p>
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
                                        <Input placeholder="Enter Service Number..." {...field} />
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
                    {!isLoading && !error && trackingResult && (
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
                             <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <LiveMap buses={[trackingResult as BusType]} />
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
                    <CardDescription>Enter the bus's registration number (e.g., AP 28 Z 5566) to see its location.</CardDescription>
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
                                        <Input placeholder="Enter Vehicle Number..." {...field} />
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
                    {!isLoading && !error && trackingResult && (
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
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <LiveMap buses={[trackingResult as BusType]} />
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
