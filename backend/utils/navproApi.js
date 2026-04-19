export const createTrip = async (tripData) => {
    console.log("Mocking request to https://api.truckerpath.com/navpro/api/trip/create");
    console.log("Payload:", JSON.stringify(tripData, null, 2));

    // If an API key was provided via env file
    if (process.env.NAVPRO_API_KEY) {
        try {
            const response = await fetch("https://api.truckerpath.com/navpro/api/trip/create", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.NAVPRO_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tripData)
            });
            return await response.json();
        } catch (error) {
            console.error("NavPro API Error:", error);
            throw error;
        }
    }

    // Returning mocked successful response
    return {
        success: true,
        trip_id: `trip_${Math.floor(Math.random() * 100000)}`,
        status: "SCHEDULED",
        message: "Trip created successfully (Mock Mode)"
    };
};
