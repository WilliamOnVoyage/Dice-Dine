import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import fs from "fs/promises";
import path from "path";
import { SavedRestaurant } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data", "favorites");

function getUserFilePath(email: string): string {
    // Sanitize email for use as filename
    const safe = email.replace(/[^a-zA-Z0-9@._-]/g, "_");
    return path.join(DATA_DIR, `${safe}.json`);
}

async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (_e) {
        // directory already exists
    }
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
    await ensureDataDir();
    const filePath = getUserFilePath(email);
    await fs.writeFile(filePath, JSON.stringify(favorites, null, 2), "utf-8");
}

// GET: Fetch all saved restaurants for the current user
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await readFavorites(session.user.email);
    return NextResponse.json({ favorites });
}

// POST: Save a restaurant
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { restaurant } = body;

    if (!restaurant?.Name || !restaurant?.Address) {
        return NextResponse.json({ error: "Restaurant Name and Address are required" }, { status: 400 });
    }

    const favorites = await readFavorites(session.user.email);

    // Check for duplicates by Name + Address
    const exists = favorites.some(
        (f) => f.Name === restaurant.Name && f.Address === restaurant.Address
    );

    if (exists) {
        return NextResponse.json({ error: "Already saved" }, { status: 409 });
    }

    const saved: SavedRestaurant = {
        ...restaurant,
        savedAt: new Date().toISOString(),
    };

    favorites.push(saved);
    await writeFavorites(session.user.email, favorites);

    return NextResponse.json({ saved, count: favorites.length });
}

// DELETE: Remove a saved restaurant
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { Name, Address } = body;

    if (!Name || !Address) {
        return NextResponse.json({ error: "Name and Address are required" }, { status: 400 });
    }

    const favorites = await readFavorites(session.user.email);
    const filtered = favorites.filter(
        (f) => !(f.Name === Name && f.Address === Address)
    );

    if (filtered.length === favorites.length) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await writeFavorites(session.user.email, filtered);
    return NextResponse.json({ count: filtered.length });
}
