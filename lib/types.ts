export interface Restaurant {
    Name: string;
    Address: string;
    Rating?: string;
    Reason?: string;
    Website?: string;
    coords?: [number, number];
}

export interface SavedRestaurant extends Restaurant {
    savedAt: string; // ISO date string
}
