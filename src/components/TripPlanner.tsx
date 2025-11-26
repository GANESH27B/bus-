"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { planTripAction } from "@/app/(public)/trip-planner/actions";
import type { TripPlan } from "@/lib/types";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, Bus, Clock, Loader2, MapPin, PersonStanding, TramFront } from "lucide-react";
import { Separator } from "./ui/separator";

const formSchema = z.object({
  start: z.string().min(3, { message: "Please enter a valid starting location." }),
  destination: z.string().min(3, { message: "Please enter a valid destination." }),
});

export function TripPlanner() {
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: "",
      destination: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setTripPlan(null);
    const result = await planTripAction(values);
    if (result.success && result.data) {
      setTripPlan(result.data);
    } else {
      setError(result.error || "An unknown error occurred.");
    }
    setIsLoading(false);
  }

  const StepIcon = ({ instruction }: { instruction: string }) => {
    const lowerInstruction = instruction.toLowerCase();
    if (lowerInstruction.includes("walk")) return <PersonStanding className="h-6 w-6 text-accent" />;
    if (lowerInstruction.includes("bus")) return <Bus className="h-6 w-6 text-accent" />;
    if (lowerInstruction.includes("start")) return <MapPin className="h-6 w-6 text-green-500" />;
    if (lowerInstruction.includes("destination")) return <MapPin className="h-6 w-6 text-red-500" />;
    return <TramFront className="h-6 w-6 text-accent" />;
  }

  return (
    <div className="grid md:grid-cols-5 gap-8">
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-6 w-6"/>
              AI Trip Planner
            </CardTitle>
            <CardDescription>
              Enter your start and end points, and we'll find the best route for you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starting Point</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Central Station" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Westside Mall" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Planning...
                    </>
                  ) : (
                    <>
                      Plan My Trip <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-3">
        <Card className="min-h-full">
          <CardHeader>
            <CardTitle>Your Suggested Itinerary</CardTitle>
            <CardDescription>Follow these steps to reach your destination.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-16">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg font-medium">Our AI is planning the optimal route...</p>
                    <p>This should only take a moment.</p>
                </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {tripPlan && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center bg-secondary p-4 rounded-lg">
                    <h3 className="text-lg font-semibold">Total Estimated Time</h3>
                    <div className="flex items-center gap-2 text-xl font-bold text-primary">
                        <Clock className="h-6 w-6"/>
                        <span>{tripPlan.totalTime}</span>
                    </div>
                </div>
                <ul className="space-y-4">
                  {tripPlan.steps.map((step, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                            <StepIcon instruction={step.instruction}/>
                          </div>
                          {index < tripPlan.steps.length - 1 && (
                            <div className="w-px h-full bg-border my-2"></div>
                          )}
                      </div>

                      <div className="flex-grow pb-4">
                        <p className="font-semibold">{step.instruction}</p>
                        {step.busNumber && (
                           <div className="text-sm text-muted-foreground mt-2 space-y-2 p-3 bg-secondary/50 rounded-md">
                                <p className="flex items-center"><Bus className="w-4 h-4 mr-2"/> <strong>Bus {step.busNumber}</strong></p>
                                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2"/>From: <strong>{step.departureStop}</strong> at {step.departureTime}</p>
                                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2"/>To: <strong>{step.arrivalStop}</strong> at {step.arrivalTime}</p>
                           </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
             {!isLoading && !tripPlan && !error && (
                <div className="text-center text-muted-foreground py-16">
                    <Bot className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">Your trip plan will appear here.</p>
                    <p>Fill out the form to get started.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
