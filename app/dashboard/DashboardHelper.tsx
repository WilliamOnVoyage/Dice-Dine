"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import LogoutButton from "@/components/LogoutButton";
import ChatInterface from "@/components/ChatInterface";

const AppMap = dynamic(() => import("@/components/AppMap"), { ssr: false });

interface User {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export default function DashboardHelper({ user }: { user?: User }) {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [userCoords, setUserCoords] = useState<[number, number] | null>(null);

    const handleLocationUpdate = async (location: string) => {
        if (!location.trim()) {
            setUserCoords(null);
            return;
        }

        // If it's GPS, parse it directly
        if (location.startsWith("GPS: ")) {
            const parts = location.replace("GPS: ", "").split(",");
            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lon = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lon)) {
                    setUserCoords([lat, lon]);
                    return;
                }
            }
        }

        // Otherwise geocode the manual input
        try {
            const res = await fetch(`/api/geocode?address=${encodeURIComponent(location)}`);
            const data = await res.json();
            if (data.lat && data.lon) {
                setUserCoords([data.lat, data.lon]);
            }
        } catch (e) {
            console.error("Failed to geocode manual location", e);
        }
    };

    const handleRecommendation = async (recs: any[]) => {
        // Optimistic update without coords (Map handles missing coords gracefully?)
        // AppMap maps `place.coords` and checks existence. 
        // If no coords, no marker. That's fine.
        setRestaurants(recs);

        // Fetch coords
        const updatedRecs = await Promise.all(
            recs.map(async (r) => {
                try {
                    const res = await fetch(`/api/geocode?address=${encodeURIComponent(r.Address)}`);
                    const data = await res.json();
                    if (data.lat && data.lon) {
                        return { ...r, coords: [data.lat, data.lon] };
                    }
                } catch (e) {
                    console.error(e);
                }
                return r;
            })
        );
        setRestaurants(updatedRecs);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 relative overflow-hidden">

            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Dice-Dine<span className="text-rose-600">.</span></h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col text-right">
                        <span className="font-semibold text-slate-900">{user?.name}</span>
                        <span className="text-xs text-slate-500">{user?.email}</span>
                    </div>
                    {user?.image && <img src={user.image} alt={user.name || "User"} className="w-10 h-10 rounded-full border border-gray-200" />}
                    <LogoutButton />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 md:p-6 gap-6 z-10">
                {/* Left: Chat */}
                <div className="w-full md:w-1/3 flex flex-col h-full min-h-[400px]">
                    <ChatInterface onRecommendation={handleRecommendation} onLocationUpdate={handleLocationUpdate} />
                </div>

                {/* Right: Map */}
                <div className="w-full md:w-2/3 h-full rounded-2xl overflow-hidden shadow-sm border border-gray-200 bg-white relative min-h-[300px]">
                    <AppMap restaurants={restaurants} userLocation={userCoords} />
                </div>
            </main>
        </div>
    );
}
