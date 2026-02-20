"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icon in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
        // Find all valid coordinates from the restaurants
        const validCoords = restaurants
            .filter((r) => r.coords)
            .map((r) => r.coords as [number, number]);

        if (validCoords.length > 0) {
            // Create a bounding box and fit the map to it
            const bounds = L.latLngBounds(validCoords);
            // If there's only one point, add a slight padding so zooming doesn't go crazy
            if (validCoords.length === 1) {
                map.setView(validCoords[0], 14);
            } else {
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
        } else if (userLocation) {
            // If no restaurants but we have a user location, center on user
            map.setView(userLocation, 13);
        } else {
            // Default center fallback
            map.setView([37.7749, -122.4194], 13);
        }
    }, [restaurants, userLocation, map]);

    return null;
}

export default function AppMap({ restaurants, userLocation }: AppMapProps) {
    // Calculate center based on restaurants, then userLocation, or default to SF
    const defaultCenter: [number, number] = [37.7749, -122.4194];

    const center = restaurants.length > 0 && restaurants[0].coords
        ? restaurants[0].coords
        : userLocation || defaultCenter;

    return (
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} className="rounded-3xl z-0">
            <MapController restaurants={restaurants} userLocation={userLocation} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {restaurants.map((place, idx) => (
                place.coords && (
                    <Marker key={idx} position={place.coords}>
                        <Popup>
                            <div className="p-1">
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
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
