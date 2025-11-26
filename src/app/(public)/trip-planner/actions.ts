"use server";

import * as z from "zod";
import type { TripPlan } from "@/lib/types";

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

  // Simulate AI processing and network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock AI response
  const mockPlan: TripPlan = {
    totalTime: "25 minutes",
    steps: [
      {
        instruction: `Start at ${validatedFields.data.start}`,
      },
      {
        instruction: "Walk 2 minutes to Grand Park station.",
      },
      {
        instruction: "Take Bus 101 towards City Hall.",
        busNumber: "101",
        departureStop: "Grand Park",
        arrivalStop: "Museum of Modern Art",
        departureTime: "10:05 AM",
        arrivalTime: "10:15 AM",
      },
      {
        instruction: `Walk 5 minutes to your destination, ${validatedFields.data.destination}.`,
      },
      {
        instruction: `You have arrived at ${validatedFields.data.destination}.`
      }
    ],
  };

  return { success: true, data: mockPlan };
}
