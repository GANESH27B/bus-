"use server";

import * as z from "zod";
import type { TripPlan } from "@/lib/types";
import { aiTripPlanner, AiTripPlannerOutput } from "@/ai/ai-trip-planner";

const formSchema = z.object({
  start: z.string().min(3, { message: "Please enter a valid starting location." }),
  destination: z.string().min(3, { message: "Please enter a valid destination." }),
  notes: z.string().optional(),
});

type PlanTripResult = {
  success: boolean;
  data?: TripPlan;
  error?: string;
};

function formatGoogleMapsUrl(start: string, destination: string, waypoints: string[]): string {
    const baseUrl = "https://www.google.com/maps/dir/";
    const searchParams = new URLSearchParams();
    searchParams.append("api", "1");
    searchParams.append("origin", start);
    searchParams.append("destination", destination);
    if (waypoints.length > 0) {
        searchParams.append("waypoints", waypoints.join("|"));
    }
    searchParams.append("travelmode", "transit");
    return `${baseUrl}?${searchParams.toString()}`;
}

export async function planTripAction(values: z.infer<typeof formSchema>): Promise<PlanTripResult> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid input." };
  }
  
  try {
    const { start, destination, notes } = validatedFields.data;
    const plan: AiTripPlannerOutput = await aiTripPlanner({
        startLocation: start,
        destination: destination,
        notes: notes,
    });

    const waypoints = plan.locations?.slice(1, -1).map(loc => loc.name).filter(Boolean) || [];

    const tripPlan: TripPlan = {
        summary: plan.summary,
        totalTime: plan.eta,
        mapsUrl: formatGoogleMapsUrl(start, destination, waypoints),
        steps: plan.routes.map((route, index) => {
            const schedule = plan.schedules[index] || "Not available";
            
            if (route.toLowerCase().includes('bus')) {
                return {
                    instruction: route,
                    busNumber: route.match(/bus (\w+)/i)?.[1] || "N/A",
                    departureTime: schedule,
                }
            }
            return { instruction: route };
        })
    };

    return { success: true, data: tripPlan };
  } catch (e: any) {
    console.error(e);
    return { success: false, error: "Failed to generate trip plan. " + e.message };
  }
}
