import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Helper to get or create a user by email
async function getOrCreateUser(email: string) {
    return prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
    });
}

// GET: Fetch all saved restaurants for the current user
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getOrCreateUser(session.user.email);
    
    const savedPlaces = await prisma.savedPlace.findMany({
        where: { userId: user.id },
        orderBy: { savedAt: 'desc' }
    });

    // Map to the existing UI format
    const favorites = savedPlaces.map(p => ({
        Name: p.name,
        Address: p.address,
        Rating: p.rating || undefined,
        Reason: p.reason || undefined,
        Website: p.website || undefined,
        coords: p.latitude && p.longitude ? [p.latitude, p.longitude] : undefined,
        savedAt: p.savedAt.toISOString(),
    }));

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

    const user = await getOrCreateUser(session.user.email);

    // Check for duplicates
    const exists = await prisma.savedPlace.findUnique({
        where: {
            userId_name_address: {
                userId: user.id,
                name: restaurant.Name,
                address: restaurant.Address
            }
        }
    });

    if (exists) {
        return NextResponse.json({ error: "Already saved" }, { status: 409 });
    }

    const newPlace = await prisma.savedPlace.create({
        data: {
            name: restaurant.Name,
            address: restaurant.Address,
            rating: restaurant.Rating || null,
            reason: restaurant.Reason || null,
            website: restaurant.Website || null,
            latitude: restaurant.coords ? restaurant.coords[0] : null,
            longitude: restaurant.coords ? restaurant.coords[1] : null,
            userId: user.id,
        }
    });

    const count = await prisma.savedPlace.count({ where: { userId: user.id } });

    return NextResponse.json({ 
        saved: {
            ...restaurant,
            savedAt: newPlace.savedAt.toISOString()
        }, 
        count 
    });
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

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    try {
        await prisma.savedPlace.delete({
            where: {
                userId_name_address: {
                    userId: user.id,
                    name: Name,
                    address: Address
                }
            }
        });

        const count = await prisma.savedPlace.count({ where: { userId: user.id } });
        return NextResponse.json({ count });
    } catch (_e) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}
