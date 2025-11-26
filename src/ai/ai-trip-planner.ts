'use server';

/**
 * @fileOverview AI trip planner flow to suggest optimal bus routes and schedules.
 *
 * - aiTripPlanner - A function that handles the trip planning process.
 * - AiTripPlannerInput - The input type for the aiTripPlanner function.
 * - AiTripPlannerOutput - The return type for the aiTripPlanner function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTripPlannerInputSchema = z.object({
  startLocation: z.string().describe('The starting location of the trip.'),
  destination: z.string().describe('The destination of the trip.'),
});

export type AiTripPlannerInput = z.infer<typeof AiTripPlannerInputSchema>;

const AiTripPlannerOutputSchema = z.object({
  routes: z
    .array(z.string())
    .describe('A list of step-by-step instructions for the trip, including walking and bus routes.'),
  schedules: z
    .array(z.string())
    .describe('A list of corresponding bus departure or arrival times for each step.'),
  eta: z.string().describe('The total estimated time of arrival for the trip (e.g., "25 minutes").'),
});

export type AiTripPlannerOutput = z.infer<typeof AiTripPlannerOutputSchema>;

export async function aiTripPlanner(input: AiTripPlannerInput): Promise<AiTripPlannerOutput> {
  return aiTripPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTripPlannerPrompt',
  input: {schema: AiTripPlannerInputSchema},
  output: {schema: AiTripPlannerOutputSchema},
  prompt: `You are an expert AI trip planner for a public bus system. Your goal is to provide the most efficient and clear route from a start location to a destination.

  Starting Location: {{{startLocation}}}
  Destination: {{{destination}}}

  Please provide a detailed, step-by-step trip plan. The plan should include:
  1.  Walking directions to bus stops.
  2.  The specific bus number to take (e.g., "Bus 101").
  3.  The names of the departure and arrival bus stops.
  4.  The estimated time for each leg of the journey.
  5.  A total estimated travel time (eta).

  The 'routes' array should contain the human-readable instructions for each step.
  The 'schedules' array should contain the corresponding time for each step (e.g., "10:05 AM" for a departure). If a step is walking, the schedule can be the estimated walk time (e.g., "5 min walk").
  The 'eta' should be a single string summarizing the total trip time.
  
  Example response format:
  {
    "routes": [
      "Walk 5 minutes to Central Station.",
      "Take Bus 101 towards City Hall.",
      "Get off at Museum of Modern Art.",
      "Walk 3 minutes to your destination."
    ],
    "schedules": [
      "5 min walk",
      "10:05 AM",
      "10:18 AM",
      "3 min walk"
    ],
    "eta": "21 minutes"
  }`,
});

const aiTripPlannerFlow = ai.defineFlow(
  {
    name: 'aiTripPlannerFlow',
    inputSchema: AiTripPlannerInputSchema,
    outputSchema: AiTripPlannerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
