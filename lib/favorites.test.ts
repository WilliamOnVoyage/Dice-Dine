import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs/promises";
import path from "path";
import { SavedRestaurant } from "./types";

// Test the favorites storage logic directly (same logic as the API route)
const TEST_DATA_DIR = path.join(process.cwd(), "data", "favorites-test");

function getUserFilePath(email: string): string {
    const safe = email.replace(/[^a-zA-Z0-9@._-]/g, "_");
    return path.join(TEST_DATA_DIR, `${safe}.json`);
}

async function readFavorites(email: string): Promise<SavedRestaurant[]> {
    const filePath = getUserFilePath(email);
    try {
        const content = await fs.readFile(filePath, "utf-8");
        return JSON.parse(content);
    } catch (_e) {
        return [];
    }
}

async function writeFavorites(email: string, favorites: SavedRestaurant[]) {
    await fs.mkdir(TEST_DATA_DIR, { recursive: true });
    const filePath = getUserFilePath(email);
    await fs.writeFile(filePath, JSON.stringify(favorites, null, 2), "utf-8");
}

const TEST_EMAIL = "test@example.com";

const sampleRestaurant: SavedRestaurant = {
    Name: "Test Sushi",
    Address: "123 Test St, San Jose, CA",
    Rating: "4.5",
    Reason: "Great for testing",
    savedAt: new Date().toISOString(),
};

describe("Favorites Storage", () => {
    beforeEach(async () => {
        // Clean up test data dir
        try {
            await fs.rm(TEST_DATA_DIR, { recursive: true });
        } catch (_e) {
            // doesn't exist yet
        }
    });

    afterEach(async () => {
        try {
            await fs.rm(TEST_DATA_DIR, { recursive: true });
        } catch (_e) {
            // cleanup
        }
    });

    it("should return empty array for new user", async () => {
        const favorites = await readFavorites(TEST_EMAIL);
        expect(favorites).toEqual([]);
    });

    it("should save and read a restaurant", async () => {
        await writeFavorites(TEST_EMAIL, [sampleRestaurant]);
        const favorites = await readFavorites(TEST_EMAIL);
        expect(favorites).toHaveLength(1);
        expect(favorites[0].Name).toBe("Test Sushi");
        expect(favorites[0].Address).toBe("123 Test St, San Jose, CA");
    });

    it("should save multiple restaurants", async () => {
        const second: SavedRestaurant = {
            Name: "Pizza Palace",
            Address: "456 Pizza Ave",
            savedAt: new Date().toISOString(),
        };

        await writeFavorites(TEST_EMAIL, [sampleRestaurant, second]);
        const favorites = await readFavorites(TEST_EMAIL);
        expect(favorites).toHaveLength(2);
    });

    it("should handle deletion by filtering", async () => {
        const second: SavedRestaurant = {
            Name: "Pizza Palace",
            Address: "456 Pizza Ave",
            savedAt: new Date().toISOString(),
        };

        await writeFavorites(TEST_EMAIL, [sampleRestaurant, second]);

        // Simulate deletion
        const all = await readFavorites(TEST_EMAIL);
        const filtered = all.filter(
            (f) => !(f.Name === "Test Sushi" && f.Address === "123 Test St, San Jose, CA")
        );
        await writeFavorites(TEST_EMAIL, filtered);

        const result = await readFavorites(TEST_EMAIL);
        expect(result).toHaveLength(1);
        expect(result[0].Name).toBe("Pizza Palace");
    });

    it("should detect duplicates correctly", async () => {
        await writeFavorites(TEST_EMAIL, [sampleRestaurant]);
        const favorites = await readFavorites(TEST_EMAIL);

        const isDuplicate = favorites.some(
            (f) => f.Name === sampleRestaurant.Name && f.Address === sampleRestaurant.Address
        );
        expect(isDuplicate).toBe(true);
    });

    it("should isolate data between users", async () => {
        const otherEmail = "other@example.com";
        await writeFavorites(TEST_EMAIL, [sampleRestaurant]);

        const otherFavorites = await readFavorites(otherEmail);
        expect(otherFavorites).toEqual([]);
    });

    it("should sanitize email for filename", () => {
        const filePath = getUserFilePath("user+special@example.com");
        expect(filePath).toContain("user_special@example.com.json");
    });
});
