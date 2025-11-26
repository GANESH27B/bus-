export async function getAPSRTCBuses(from: string, to: string, date: string) {
    const url = "https://www.apsrtconline.in/oprs-web/avail/services.do";
  
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                sourceCity: from,
                destinationCity: to,
                journeyDate: date,
            }).toString(),
          });
        
          if (!res.ok) {
            throw new Error(`APSRTC API request failed with status: ${res.status}`);
          }
        
          const data = await res.json();
          return data;
    } catch (error) {
        console.error("Failed to fetch from APSRTC API:", error);
        return { error: "Could not fetch bus data." };
    }

}
