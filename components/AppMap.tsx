"use client";

import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface Restaurant {
    Name: string;
    Address: string;
    coords?: [number, number]; // [lat, lon]
    Rating?: string;
    Reason?: string;
    Website?: string;
}

interface AppMapProps {
    restaurants: Restaurant[];
    userLocation?: [number, number] | null;
}

function MapController({ restaurants, userLocation }: { restaurants: Restaurant[], userLocation?: [number, number] | null }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Find all valid coordinates from the restaurants
        const validCoords = restaurants
            .filter((r) => r.coords)
            .map((r) => ({ lat: r.coords![0], lng: r.coords![1] }));

        if (validCoords.length > 0) {
            // Create a bounding box and fit the map to it
            const bounds = new google.maps.LatLngBounds();
            validCoords.forEach((coord) => bounds.extend(coord));

            // If there's only one point, setting bounds will zoom in too far.
            if (validCoords.length === 1) {
                map.setCenter(validCoords[0]);
                map.setZoom(14);
            } else {
                map.fitBounds(bounds, 50); // 50px padding
            }
        } else if (userLocation) {
            // If no restaurants but we have a user location, center on user
            map.setCenter({ lat: userLocation[0], lng: userLocation[1] });
            map.setZoom(13);
        } else {
            // Default center fallback
            map.setCenter({ lat: 37.7749, lng: -122.4194 });
            map.setZoom(13);
        }
    }, [restaurants, userLocation, map]);

    return null;
}

export default function AppMap({ restaurants, userLocation }: AppMapProps) {
    // We use a state to manage which InfoWindow is currently open
    const [selectedPlaceIdx, setSelectedPlaceIdx] = useState<number | null>(null);

    // Calculate center based on restaurants, then userLocation, or default to SF
    const defaultCenter = { lat: 37.7749, lng: -122.4194 };

    const center = restaurants.length > 0 && restaurants[0].coords
        ? { lat: restaurants[0].coords[0], lng: restaurants[0].coords[1] }
        : (userLocation ? { lat: userLocation[0], lng: userLocation[1] } : defaultCenter);

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    if (!apiKey) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 text-slate-500 rounded-2xl">
                <p>Google Maps API Key missing.</p>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <Map
                defaultCenter={center}
                defaultZoom={13}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                mapId={"DEMO_MAP_ID"} // Required for AdvancedMarker
                className="w-full h-full rounded-2xl"
            >
                <MapController restaurants={restaurants} userLocation={userLocation} />

                {restaurants.map((place, idx) => {
                    if (!place.coords) return null;
                    const position = { lat: place.coords[0], lng: place.coords[1] };

                    return (
                        <div key={idx}>
                            <AdvancedMarker
                                position={position}
                                onClick={() => setSelectedPlaceIdx(idx)}
                            />
                            {selectedPlaceIdx === idx && (
                                <InfoWindow
                                    position={position}
                                    onCloseClick={() => setSelectedPlaceIdx(null)}
                                >
                                    <div className="p-1 max-w-[200px]">
                                        {place.Website ? (
                                            <a href={place.Website} target="_blank" rel="noopener noreferrer" className="font-bold text-base text-slate-900 hover:text-rose-600 hover:underline transition-colors block">
                                                {place.Name}
                                            </a>
                                        ) : (
                                            <h3 className="font-bold text-base">{place.Name}</h3>
                                        )}
                                        <p className="text-sm text-gray-600 mt-1">{place.Address}</p>
                                        {place.Rating && <p className="text-xs text-orange-500 font-semibold mt-1">Rating: {place.Rating}</p>}
                                    </div>
                                </InfoWindow>
                            )}
                        </div>
                    );
                })}
            </Map>
        </APIProvider>
    );
}
