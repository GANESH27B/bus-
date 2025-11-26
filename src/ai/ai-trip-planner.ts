// AITripPlanner flow

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
    .describe('A list of optimal bus routes for the trip.'),
  schedules: z
    .array(z.string())
    .describe('A list of bus schedules for the trip.'),
  eta: z.string().describe('The estimated time of arrival for the trip.'),
});

export type AiTripPlannerOutput = z.infer<typeof AiTripPlannerOutputSchema>;

export async function aiTripPlanner(input: AiTripPlannerInput): Promise<AiTripPlannerOutput> {
  return aiTripPlannerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiTripPlannerPrompt',
  input: {schema: AiTripPlannerInputSchema},
  output: {schema: AiTripPlannerOutputSchema},
  prompt: `You are an AI trip planner that suggests optimal bus routes and schedules for a trip.

  Given the starting location and destination, suggest the optimal bus routes and schedules.

  Starting Location: {{{startLocation}}}
  Destination: {{{destination}}}

  Format your response as a JSON object with the following keys:
  - routes: A list of optimal bus routes for the trip.
  - schedules: A list of bus schedules for the trip.
  - eta: The estimated time of arrival for the trip.`,
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
