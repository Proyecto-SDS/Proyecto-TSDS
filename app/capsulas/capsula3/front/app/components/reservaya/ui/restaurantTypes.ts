export interface Restaurant {
    id: number,
    name: string,
    type: string,
    rating: number,
    hours: string,
    distance: string,
    address: string,
    position: {
        top: string;
        left: string;
    }
}

