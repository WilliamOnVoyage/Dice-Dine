import { describe, it, expect } from "vitest";
import { parseBotResponse } from "./utils";

describe("parseBotResponse", () => {
    it("should parse a valid recommendation JSON response", () => {
        const json = JSON.stringify({
            Summary: "Here are some great sushi spots!",
            "Recommended Restaurants": [
                {
                    Name: "Sushi Zen",
                    Address: "123 Main St, San Jose, CA",
                    Rating: "4.5",
                    Reason: "Excellent fish quality",
                },
            ],
            Ask: "Would you like more options?",
        });

        const result = parseBotResponse(json);
        expect(result.type).toBe("recommendation");
        expect(result.data).toBeDefined();
        expect(result.data["Recommended Restaurants"]).toHaveLength(1);
        expect(result.data["Recommended Restaurants"][0].Name).toBe("Sushi Zen");
        expect(result.data["Summary"]).toBe("Here are some great sushi spots!");
    });

    it("should parse JSON wrapped in markdown code blocks", () => {
        const json = "```json\n" + JSON.stringify({
            Summary: "Top picks",
            "Recommended Restaurants": [],
            Ask: "More?",
        }) + "\n```";

        const result = parseBotResponse(json);
        expect(result.type).toBe("recommendation");
        expect(result.data["Summary"]).toBe("Top picks");
    });

    it("should return text type for plain text responses", () => {
        const result = parseBotResponse("I need more information about your preferences.");
        expect(result.type).toBe("text");
        expect(result.content).toBe("I need more information about your preferences.");
    });

    it("should return text type for invalid JSON", () => {
        const result = parseBotResponse("{invalid json here}");
        expect(result.type).toBe("text");
        expect(result.content).toBe("{invalid json here}");
    });

    it("should return text type for JSON missing required fields", () => {
        const json = JSON.stringify({ foo: "bar" });
        const result = parseBotResponse(json);
        expect(result.type).toBe("text");
        expect(result.content).toBe(json);
    });
});
