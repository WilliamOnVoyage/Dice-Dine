"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, Trash2, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { SavedRestaurant } from "@/lib/types";

interface SavedPlacesProps {
    onSelectPlace?: (restaurant: SavedRestaurant) => void;
    refreshTrigger?: number; // increment to trigger refresh
}

export default function SavedPlaces({ onSelectPlace, refreshTrigger }: SavedPlacesProps) {
    const [favorites, setFavorites] = useState<SavedRestaurant[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchFavorites = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/favorites");
            const data = await res.json();
            if (data.favorites) {
                setFavorites(data.favorites);
            }
        } catch (e) {
            console.error("Failed to fetch favorites", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites, refreshTrigger]);

    const handleRemove = async (name: string, address: string) => {
        try {
            const res = await fetch("/api/favorites", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Name: name, Address: address }),
            });

            if (res.ok) {
                setFavorites((prev) =>
                    prev.filter((f) => !(f.Name === name && f.Address === address))
                );
            }
        } catch (e) {
            console.error("Failed to remove favorite", e);
        }
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Toggle Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Bookmark size={18} className="text-rose-600" />
                    <span className="font-bold text-slate-900 text-sm">
                        Saved Places
                    </span>
                    {favorites.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {favorites.length}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp size={16} className="text-slate-400" />
                ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                )}
            </button>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="border-t border-gray-100">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-slate-400 animate-pulse">
                            Loading...
                        </div>
                    ) : favorites.length === 0 ? (
                        <div className="p-6 text-center">
                            <p className="text-sm text-slate-400">No saved places yet.</p>
                            <p className="text-xs text-slate-300 mt-1">
                                Tap the bookmark icon on recommendations to save them.
                            </p>
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-100">
                            {favorites.map((fav, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 hover:bg-gray-50 transition-colors group cursor-pointer"
                                    onClick={() => onSelectPlace?.(fav)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                {fav.Website ? (
                                                    <a
                                                        href={fav.Website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-sm text-slate-900 hover:text-rose-600 transition-colors truncate flex items-center gap-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {fav.Name}
                                                        <ExternalLink size={12} className="shrink-0" />
                                                    </a>
                                                ) : (
                                                    <span className="font-semibold text-sm text-slate-900 truncate">
                                                        {fav.Name}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400 truncate mt-0.5">{fav.Address}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                {fav.Rating && (
                                                    <span className="text-xs text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                                                        {fav.Rating}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-300">
                                                    Saved {formatDate(fav.savedAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(fav.Name, fav.Address);
                                            }}
                                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                            title="Remove from saved"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
