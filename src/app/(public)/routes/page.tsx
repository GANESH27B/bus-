'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAvailableServices } from './actions';
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
import { Loader2, Search, Bus } from 'lucide-react';

const formSchema = z.object({
  from: z.string().min(3, { message: 'Please enter a valid location.' }),
  to: z.string().min(3, { message: 'Please enter a valid location.' }),
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'Date must be in DD/MM/YYYY format.',
  }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from: '',
      to: '',
      date: new Date().toLocaleDateString('en-GB'),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setServices(null);
    setSearched(true);

    const result = await getAvailableServices(values);

    if (result.success && result.data) {
      setServices(result.data);
    } else {
      setError(result.error || 'An unknown error occurred.');
    }
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">
          Live Routes & Schedules
        </h1>
        <p className="text-muted-foreground">
          Find available bus services for your journey in real-time.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search for Services</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid sm:grid-cols-3 gap-4"
            >
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input placeholder="DD/MM/YYYY" {...field} />
                    </FormControl>
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
        <CardHeader>
          <CardTitle>Available Services</CardTitle>
          <CardDescription>
            List of services based on your search criteria.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-3 h-8 w-8 animate-spin" />
              <p>Loading live bus data...</p>
            </div>
          )}
          {error && <p className="text-destructive text-center">{error}</p>}
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
          {!isLoading && searched && services?.length === 0 && (
             <div className="text-center text-muted-foreground py-16">
                <Bus className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">No services found.</p>
                <p>There are no buses available for the selected route and date.</p>
            </div>
          )}
           {!isLoading && !searched && (
             <div className="text-center text-muted-foreground py-16">
                <Search className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Your search results will appear here.</p>
                <p>Fill out the form to find available buses.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
