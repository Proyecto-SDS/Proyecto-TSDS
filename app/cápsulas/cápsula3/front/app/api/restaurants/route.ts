import { NextResponse } from "next/server";
import { restaurantsData } from "@/app/data/restaurantsData";

// Función Haversine corregida para calcular distancia entre dos coordenadas (LAT/LNG)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radio de la Tierra en km
  const lat1Rad = lat1 * (Math.PI / 180);
  const lat2Rad = lat2 * (Math.PI / 180);
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Devolvemos la distancia en km, redondeada.
  return parseFloat(distance.toFixed(1));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category");
  const userLat = parseFloat(searchParams.get("lat") || "0");
  const userLng = parseFloat(searchParams.get("lng") || "0");

  // Coordenadas Mock actualizadas a tu ubicación (Longitud, Latitud)
  const coordsMap: Record<number, [number, number]> = {
    // FORMATO: [LONGITUD (LNG), LATITUD (LAT)]
    1: [-70.6551, -33.1836],
    2: [-70.654, -33.184],
    3: [-70.6565, -33.183],
    4: [-70.6555, -33.1845],
    5: [-70.6545, -33.1833],
  };

  let results = Object.values(restaurantsData).map((r) => {
    const coords = coordsMap[r.id] || [-70.6551, -33.1836];
    const [start, end] = r.hours.split(" - ");

    return {
      ...r,
      lat: coords[1], // LATITUD
      lng: coords[0], // LONGITUD
      openTime: start || "09:00",
      closeTime: end || "22:00",

      // LLAMADA CORREGIDA: getDistance(LAT_1, LNG_1, LAT_2, LNG_2)
      distanceKm:
        userLat && userLng
          ? getDistance(userLat, userLng, coords[1], coords[0])
          : 0,
    };
  });

  // 2. Filtrado por Texto
  if (search) {
    results = results.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.type.toLowerCase().includes(search)
    );
  }

  // 3. Filtrado por Categoría
  if (category && category !== "all") {
    results = results.filter((r) => r.type === category);
  }

  // 4. Filtrado por Proximidad (Radio de búsqueda) - ¡RE-ACTIVADO!
  const MAX_DISTANCE_KM = 10; // Se mostrarán los restaurantes a 10 km a la redonda

  if (userLat && userLng) {
    results = results.filter(
      (r) => r.distanceKm !== undefined && r.distanceKm <= MAX_DISTANCE_KM
    );

    // Opcional: Ordenar por distancia (los más cercanos primero)
    results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  // 5. Retornar resultados
  return NextResponse.json(results);
}
