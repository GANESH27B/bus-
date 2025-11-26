"use server";

import * as z from "zod";
import type { TripPlan } from "@/lib/types";
import { aiTripPlanner } from "@/ai/ai-trip-planner";

const formSchema = z.object({
  start: z.string(),
  destination: z.string(),
});

type PlanTripResult = {
  success: boolean;
  data?: TripPlan;
  error?: string;
};

export async function planTripAction(values: z.infer<typeof formSchema>): Promise<PlanTripResult> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid input." };
  }
  
  try {
    const plan = await aiTripPlanner({
        startLocation: validatedFields.data.start,
        destination: validatedFields.data.destination,
    });

    // The AI output needs to be mapped to the TripPlan type.
    // This is a simplified mapping. A more robust implementation might
    // involve more complex parsing or a more structured AI output.
    const tripPlan: TripPlan = {
        totalTime: plan.eta,
        steps: plan.routes.map((route, index) => {
            const schedule = plan.schedules[index] || "Not available";
            
            // A simple heuristic to check if the step is a bus ride
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
