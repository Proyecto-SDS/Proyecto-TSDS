// lib/api/types.ts

export type RestaurantType = "Restaurante" | "Restobar" | "Cafetería";

export interface Restaurant {
  id: number;
  name: string;
  type: RestaurantType;
  lat: number;
  lng: number;
  rating: number;
  address: string;
  openTime: string; // "08:00"
  closeTime: string; // "20:00"
  distanceKm?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
}

export interface RestaurantDetail extends Restaurant {
  menu: MenuItem[];
  photos?: string[];
}

export interface ReservationItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

export type ReservationStatus = "confirmed" | "cancelled" | "pending";

export interface Reservation {
  id: string | number;
  userId: string | number;
  restaurantId: number;
  restaurantName: string;
  date: string; // "2025-11-20"
  time: string; // "19:00"
  guests: number;
  items: ReservationItem[];
  total: number;
  status: ReservationStatus;
  qr?: string; // URL o base64
}

export interface CreateReservationPayload {
  userId: string | number;
  restaurantId: number;
  date: string;
  time: string;
  guests: number;
  items: Array<{
    id: number; // id del producto
    quantity: number;
  }>;
}
