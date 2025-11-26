
"use server";

import * as z from "zod";

const formSchema = z.object({
  from: z.string().min(3),
  to: z.string().min(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/), // ISO String
});

type Service = {
    duration: string;
    distance: string;
    steps: {
        instruction: string;
        travelMode: string;
        duration: string;
        distance: string;
    }[];
};

type ActionResult = {
  success: boolean;
  data?: any;
  error?: string;
};

function formatDistance(meters: number): string {
    if (meters < 1000) {
        return `${meters.toFixed(0)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
}

export async function getAvailableServices(
  values: z.infer<typeof formSchema>
): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    console.error("Invalid input:", validatedFields.error.flatten().fieldErrors);
    return { success: false, error: "Invalid input provided." };
  }

  const { from, to, date } = validatedFields.data;
  const url = "https://routes.googleapis.com/directions/v2:computeRoutes";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return { success: false, error: "API key is not configured." };
  }

  try {
    const body = {
        origin: { address: from },
        destination: { address: to },
        travelMode: "TRANSIT",
        computeAlternativeRoutes: true,
        transitPreferences: {
            allowedTravelModes: ["BUS"],
        },
        departureTime: date,
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.legs.steps",
      },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
        const errorBody = await res.json();
        console.error("Google Routes API Error:", errorBody);
        throw new Error(errorBody.error.message || `API request failed with status: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.routes || data.routes.length === 0) {
        return { success: true, data: [] };
    }
    
    const formattedServices: Service[] = data.routes.map((route: any) => ({
      duration: route.duration,
      distance: formatDistance(route.distanceMeters),
      steps: route.legs[0].steps.map((step: any) => ({
        instruction: step.transitDetails?.headsign || step.navigationInstruction?.instructions || "Proceed",
        travelMode: step.travelMode,
        duration: step.duration,
        distance: formatDistance(step.distanceMeters),
      }))
    }));
    
    return { success: true, data: formattedServices };

  } catch (error: any) {
    console.error("Failed to fetch Google Routes services:", error);
    return {
      success: false,
      error: "Could not fetch bus services. The external API may be down or the parameters are incorrect.",
    };
  }
}


export async function trackByServiceNumber(serviceNumber: string): Promise<ActionResult> {
  // This is a mock implementation.
  // In a real app, you would call an API to get the status.
  console.log(`Tracking service number: ${serviceNumber}`);
  if (!serviceNumber) {
    return { success: false, error: "Please provide a service number." };
  }
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return {
    success: true,
    data: {
      id: serviceNumber,
      status: "On Time",
      location: "Approaching Bus Terminal",
      eta: "15 minutes",
      number: serviceNumber,
      routeId: "route-1",
      lat: 34.054,
      lng: -118.243,
      driver: 'Anil Kumar',
      lastUpdated: new Date().toISOString(),
    },
  };
}

export async function trackByVehicleNumber(vehicleNumber: string): Promise<ActionResult> {
  // This is a mock implementation.
  console.log(`Tracking vehicle number: ${vehicleNumber}`);
  if (!vehicleNumber) {
    return { success: false, error: "Please provide a vehicle number." };
  }
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return {
    success: true,
    data: {
      id: vehicleNumber,
      status: "Active",
      location: "West End Shopping Center",
      route: "202 - Industrial Area Shuttle",
      number: vehicleNumber,
      routeId: "route-2",
      lat: 34.035,
      lng: -118.265,
      driver: 'Sunita Sharma',
      lastUpdated: new Date().toISOString(),
    },
  };
}

    

    