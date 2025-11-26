"use server";

import * as z from "zod";

const formSchema = z.object({
  from: z.string().min(3),
  to: z.string().min(3),
  date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/),
});

type Service = {
  serviceName: string;
  serviceId: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  seatsAvailable: string;
};

type ActionResult = {
  success: boolean;
  data?: Service[];
  error?: string;
};

// A simple utility to format duration from minutes to "Xh Ym"
function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

export async function getAvailableServices(
  values: z.infer<typeof formSchema>
): Promise<ActionResult> {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid input provided." };
  }

  const { from, to, date } = validatedFields.data;
  const url = "https://www.apsrtconline.in/oprs-web/avail/services.do";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
          sourceCity: from,
          destinationCity: to,
          journeyDate: date,
      })
    });
    
    if (!res.ok) {
        throw new Error(`API request failed with status: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.serviceAvailList || data.serviceAvailList.length === 0) {
        return { success: true, data: [] };
    }

    // Transform the API data into the format our frontend expects
    const formattedServices: Service[] = data.serviceAvailList.map((service: any) => ({
      serviceName: service.serviceName,
      serviceId: service.serviceId,
      departureTime: service.departureTime,
      arrivalTime: service.arrivalTime,
      duration: service.travelTime, // Assuming travelTime is what we need for duration
      seatsAvailable: service.seatsAvailable,
    }));
    
    return { success: true, data: formattedServices };

  } catch (error: any) {
    console.error("Failed to fetch APSRTC services:", error);
    return {
      success: false,
      error: "Could not fetch bus services. The external API may be down or the parameters are incorrect.",
    };
  }
}
