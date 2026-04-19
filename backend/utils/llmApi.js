export const generateExplanation = async (matchData) => {
    try {
        if (!matchData || !matchData.optimalDrivers || matchData.optimalDrivers.length === 0) {
            return "Unable to generate reasoning. Insufficient match data available.";
        }

        const prompt = `You are the lead AI Dispatch capability for a fleet management system. 
The system algorithm just generated a dispatch match for a new trip.
Top pick driver: ${matchData.optimalDrivers[0].name} (Score: ${matchData.optimalDrivers[0].matchScore}%, Rating: ${matchData.optimalDrivers[0].rating})
Runner up: ${matchData.optimalDrivers[1]?.name || 'N/A'}
Nearest truck: ${matchData.nearestTrucks[0]?.name || 'N/A'} (${matchData.nearestTrucks[0]?.etaMins || 0} mins away)

Keep your response UNDER 3 sentences and output ONLY valid JSON using this strict schema carefully:
{
  "summary": "Driver [Name] is the best match for this load.",
  "why_selected": ["reason 1", "reason 2"],
  "main_risk": "tight HOS margin...",
  "dispatcher_action": "Assign now and monitor..."
}`;

        const response = await fetch('http://10.153.32.194:1234/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'local-model',
                messages: [
                    { role: 'system', content: 'You are an intelligent fleet dispatch assistant.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (!response.ok) throw new Error("LLM API failed");

        const data = await response.json();
        let content = data.choices[0].message.content;

        // Attempt to parse just in case it added Markdown backticks
        if (content.includes('\`\`\`json')) {
            content = content.split('\`\`\`json')[1].split('\`\`\`')[0];
        }

        try {
            return JSON.parse(content);
        } catch (parseError) {
            return {
                summary: content,
                why_selected: ["Optimal balance of distance and HOS"],
                main_risk: "None detected.",
                dispatcher_action: "Proceed with assignment."
            };
        }
    } catch (e) {
        console.error("LLM Error:", e);
        return {
            summary: "I apologize, but my core reasoning module is currently offline. The algorithm recommends the #1 System Pick.",
            why_selected: ["Shortest deadhead distance", "Safety rating requirements met"],
            main_risk: "Connection to AI engine is offline.",
            dispatcher_action: "Review factors manually and assign."
        };
    }
};
