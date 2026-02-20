import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function parseBotResponse(responseText: string) {
    try {
        // Clean up markdown code blocks if present
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();

        // Attempt to parse JSON
        const retJson = JSON.parse(cleanedText);

        // Check if it has the expected structure
        if (
            "Summary" in retJson &&
            "Recommended Restaurants" in retJson &&
            "Ask" in retJson
        ) {
            return {
                type: "recommendation",
                data: retJson,
            };
        }
    } catch (e) {
        // If JSON parse fails, it's a plain text response
    }

    return {
        type: "text",
        content: responseText,
    };
}
