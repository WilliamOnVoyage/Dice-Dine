import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");

    if (!address) {
        return NextResponse.json({ error: "Address required" }, { status: 400 });
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Dice-Dine-Web/1.0",
            },
        });
        const data = await res.json();

        if (data && data.length > 0) {
            return NextResponse.json({
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
            });
        }

        return NextResponse.json({ error: "Not found" }, { status: 404 });
    } catch (error) {
        return NextResponse.json({ error: "Geocoding error" }, { status: 500 });
    }
}
