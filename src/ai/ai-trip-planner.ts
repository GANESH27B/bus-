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
  notes: z.string().optional().describe('Additional preferences or notes from the user for planning the trip (e.g., "avoid transfers", "prefer scenic route").'),
});

export type AiTripPlannerInput = z.infer<typeof AiTripPlannerInputSchema>;

const AiTripPlannerOutputSchema = z.object({
  summary: z.string().describe('A brief, one or two-sentence summary of the overall trip.'),
  routes: z.array(z.string()).describe('A list of step-by-step instructions for the trip, including walking and bus routes.'),
  schedules: z.array(z.string()).describe('A list of corresponding bus departure or arrival times for each step.'),
  eta: z.string().describe('The total estimated time of arrival for the trip (e.g., "25 minutes").'),
  locations: z.array(z.object({
    name: z.string().describe("The name of the location or stop for this step."),
  })).describe("An array of location names corresponding to the 'routes' array. Used to generate map links."),
});


export type AiTripPlannerOutput = z.infer<typeof AiTripPlannerOutputSchema>;

export async function aiTripPlanner(input: AiTripPlannerInput): Promise<AiTripPlannerOutput> {
  return aiTripPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTripPlannerPrompt',
  input: {schema: AiTripPlannerInputSchema},
  output: {schema: AiTripPlannerOutputSchema},
  prompt: `You are an expert AI trip planner for a public bus system. Your goal is to provide the most efficient and clear route from a start location to a destination, taking into account user preferences.

  Starting Location: {{{startLocation}}}
  Destination: {{{destination}}}
  User Preferences: {{{notes}}}

  Please provide a detailed, step-by-step trip plan. The plan should include:
  1. A short summary of the trip.
  2. Walking directions to bus stops.
  3. The specific bus number to take (e.g., "Bus 101").
  4. The names of the departure and arrival bus stops.
  5. The estimated time for each leg of the journey.
  6. A total estimated travel time (eta).
  7. A list of location names for each route step to be used in a mapping application.

  The 'summary' should be a concise overview of the journey.
  The 'routes' array should contain the human-readable instructions for each step.
  The 'schedules' array should contain the corresponding time for each step (e.g., "10:05 AM" for a departure). If a step is walking, the schedule can be the estimated walk time (e.g., "5 min walk").
  The 'eta' should be a single string summarizing the total trip time.
  The 'locations' array should contain the name of the key location or stop for each step in the 'routes' array (e.g., "Central Station", "Museum of Modern Art"). This must have the same number of items as the 'routes' array.
  
  Example response format:
  {
    "summary": "A quick 21-minute trip with one bus connection.",
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
    "eta": "21 minutes",
    "locations": [
      { "name": "Central Station" },
      { "name": "Museum of Modern Art" },
      { "name": "Museum of Modern Art" },
      { "name": "Your Destination" }
    ]
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
