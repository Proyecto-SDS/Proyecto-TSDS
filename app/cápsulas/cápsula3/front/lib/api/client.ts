// lib/api/client.ts
"use client";

import {
  Restaurant,
  RestaurantDetail,
  Reservation,
  CreateReservationPayload,
} from "./types";

const API_BASE_URL = "http://localhost:3000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API error ${res.status} ${res.statusText} in ${url}: ${text}`
    );
  }

  return res.json() as Promise<T>;
}

/**
 * GET /api/restaurants
 */
export async function getRestaurants(params?: {
  search?: string;
  category?: string;
  lat?: number;
  lng?: number;
}): Promise<Restaurant[]> {
  const query = new URLSearchParams();

  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "all")
    query.set("category", params.category);
  if (typeof params?.lat === "number") query.set("lat", String(params.lat));
  if (typeof params?.lng === "number") query.set("lng", String(params.lng));

  const qs = query.toString();
  const path = qs ? `/api/restaurants?${qs}` : `/api/restaurants`;

  return apiFetch<Restaurant[]>(path);
}

/**
 * GET /api/restaurants/:id
 */
export async function getRestaurantById(
  id: number | string
): Promise<RestaurantDetail> {
  return apiFetch<RestaurantDetail>(`/api/restaurants/${id}`);
}

/**
 * GET /api/reservations?userId=...
 */
export async function getReservations(
  userId: string | number
): Promise<Reservation[]> {
  const path = `/api/reservations?userId=${encodeURIComponent(String(userId))}`;
  return apiFetch<Reservation[]>(path);
}

/**
 * GET /api/reservations/:id
 */
export async function getReservationById(
  id: string | number
): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservations/${id}`);
}

/**
 * POST /api/reservations
 */
export async function createReservation(
  payload: CreateReservationPayload
): Promise<Reservation> {
  return apiFetch<Reservation>("/api/reservations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
