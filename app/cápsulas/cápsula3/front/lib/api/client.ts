// lib/api/client.ts
"use client";

import {
  Restaurant,
  RestaurantDetail,
  Reservation,
  CreateReservationPayload,
} from "./types";

// CAMBIO 1: Apuntamos al servidor Flask (puerto 5000)
const API_BASE_URL = "http://localhost:5000";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      // Es crucial que el Backend tenga configurado CORS para aceptar peticiones de 3000
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
 * GET /api/locales (Reemplaza /api/restaurants)
 */
export async function getRestaurants(params?: {
  search?: string;
  category?: string;
  lat?: number;
  lng?: number;
}): Promise<Restaurant[]> {
  const query = new URLSearchParams();
  let endpoint = "/api/locales";

  // 1. Lógica de búsqueda
  if (params?.search && params.search.length > 0) {
    endpoint = "/api/search";
    query.set("q", params.search);
  }

  // 2. Filtros
  if (params?.category && params.category !== "all") {
    query.set("tipo", params.category);
  }
  if (typeof params?.lat === "number") query.set("lat", String(params.lat));
  if (typeof params?.lng === "number") query.set("lng", String(params.lng));

  const path = `${endpoint}?${query.toString()}`;
  console.log("Consultando:", path);

  try {
    const data = await apiFetch<any[]>(path);

    // 3. ADAPTADOR (Blindado para tu JSON específico)
    return data.map((item) => {
      // Manejo seguro de la Dirección (que viene como objeto)
      let addressStr = "Dirección no disponible";
      if (typeof item.direccion === "string") {
        addressStr = item.direccion;
      } else if (item.direccion && typeof item.direccion === "object") {
        // Si es objeto, unimos comuna y número (ya que 'calle' no se ve en tu foto)
        const { comuna, numero, calle } = item.direccion;
        addressStr = [calle, numero, comuna].filter(Boolean).join(", ");
      }

      return {
        id: item.id,
        name: item.nombre || item.name || "Sin Nombre",
        // Si tipo es null, asumimos "Restaurante" para que no desaparezca
        type: item.tipo || "Restaurante",
        rating: parseFloat(item.rating || "4.5"),
        address: addressStr,

        // Horarios
        openTime: item.hora_apertura || "09:00",
        closeTime: item.hora_cierre || "22:00",

        // Coordenadas: Usamos las de la raíz (lat/lng) que se ven en tu foto
        lat: parseFloat(
          item.lat || (item.direccion && item.direccion.latitud) || "-33.4489"
        ),
        lng: parseFloat(
          item.lng || (item.direccion && item.direccion.longitud) || "-70.6693"
        ),

        distanceKm: parseFloat(item.distancia_km || "0"),
      };
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return [];
  }
}

/**
 * GET /api/locales/:id (Reemplaza /api/restaurants/:id)
 */
export async function getRestaurantById(
  id: number | string
): Promise<RestaurantDetail> {
  // CAMBIO 3: Usamos el endpoint real /api/locales/{id}
  // NOTA: Si el backend regresa 'nombre' en lugar de 'name', tendrás que adaptar aquí también
  return apiFetch<RestaurantDetail>(`/api/locales/${id}`);
}

/**
 * GET /api/reservas?userId=... (Ruta actualizada)
 */
export async function getReservations(
  userId: string | number
): Promise<Reservation[]> {
  // CAMBIO 4: Usamos el endpoint real /api/reservas
  const path = `/api/reservas?userId=${encodeURIComponent(String(userId))}`;
  return apiFetch<Reservation[]>(path);
}

/**
 * GET /api/reservas/:id (Ruta actualizada)
 */
export async function getReservationById(
  id: string | number
): Promise<Reservation> {
  return apiFetch<Reservation>(`/api/reservas/${id}`);
}

/**
 * POST /api/reservas (Ruta actualizada)
 */
export async function createReservation(
  payload: CreateReservationPayload
): Promise<Reservation> {
  return apiFetch<Reservation>("/api/reservas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
