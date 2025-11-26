
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
    const body = new URLSearchParams({
        sourceCity: from,
        destinationCity: to,
        journeyDate: date,
    }).toString();

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": "https://www.apsrtconline.in/oprs-web/guest/home.do",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
      },
      body: body,
    });
    
    if (!res.ok) {
        const errorBody = await res.text();
        console.error("APSRTC API Error:", errorBody);
        throw new Error(`API request failed with status: ${res.status}`);
    }

    const data = await res.json();
    
    if (!data.serviceAvailList || data.serviceAvailList.length === 0) {
        return { success: true, data: [] };
    }

    const formattedServices: Service[] = data.serviceAvailList.map((service: any) => ({
      serviceName: service.serviceName,
      serviceId: service.serviceId,
      departureTime: service.departureTime,
      arrivalTime: service.arrivalTime,
      duration: service.travelTime,
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
