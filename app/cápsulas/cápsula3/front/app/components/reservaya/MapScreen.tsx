"use client";

import {
  MapPin,
  Search,
  Star,
  Clock,
  UtensilsCrossed,
  Heart,
} from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { UserMenu } from "./UserMenu";

import Map, { Marker, Popup, MapRef } from "react-map-gl";
import { useEffect, useState, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

import { getRestaurants } from "@/lib/api/client";
import type { Restaurant as ApiRestaurant } from "@/lib/api/types";

interface MapRestaurant {
  id: number;
  name: string;
  type: string;
  rating: number;
  hours: string;
  distance: string;
  coordinates: [number, number]; // [lng, lat]
}

// Datos de ejemplo mientras el backend no está listo
const mockRestaurants: MapRestaurant[] = [
  {
    id: 1,
    name: "King Halo",
    type: "Restaurante",
    rating: 4.8,
    hours: "11:00 AM - 10:00 PM",
    distance: "0.5 km",
    coordinates: [-77.0428, -12.0464],
  },
  {
    id: 2,
    name: "La Paella Real",
    type: "Restobar",
    rating: 4.6,
    hours: "12:00 PM - 11:00 PM",
    distance: "1.2 km",
    coordinates: [-77.0328, -12.0364],
  },
  {
    id: 3,
    name: "Café del Mar",
    type: "Cafetería",
    rating: 4.9,
    hours: "8:00 AM - 8:00 PM",
    distance: "0.8 km",
    coordinates: [-77.0528, -12.0564],
  },
];

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export function MapScreen({
  selectedRestaurant,
  onSelectRestaurant,
  onViewDetails,
  onViewFavorites,
  onViewReservations,
  onLogout,
  favorites,
  onToggleFavorite,
}: {
  selectedRestaurant: number | null;
  onSelectRestaurant: (id: number | null) => void;
  onViewDetails: () => void;
  onViewFavorites: () => void;
  onViewReservations: () => void;
  onLogout: () => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  const [restaurants, setRestaurants] =
    useState<MapRestaurant[]>(mockRestaurants);
  const [popupInfo, setPopupInfo] = useState<MapRestaurant | null>(null);
  const mapRef = useRef<MapRef>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "Restaurante" | "Restobar" | "Cafetería"
  >("all");

  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Tu navegador no soporta geolocalización");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setLocationError(
          "No pudimos obtener tu ubicación. Revisa los permisos."
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // Efecto para obtener ubicación automática al cargar la página
  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setIsLocating(false);
        },
        (err) => {
          console.log(
            "Ubicación automática falló o denegada (silencioso)",
            err
          );
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // 👇 NUEVO EFECTO: Mover la cámara cuando tengamos ubicación
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 2000, // Animación suave de 2 segundos
      });
    }
  }, [userLocation]);

  // 🔌 Cargar restaurantes desde el backend (AHORA REAL)
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1. Preparamos los parámetros para enviar a TU nueva API
        const params: any = {};

        // Si hay texto en el buscador
        if (search) params.search = search;

        // Si hay categoría seleccionada (y no es "all")
        if (selectedCategory !== "all") params.category = selectedCategory;

        // Si tenemos ubicación, la enviamos para que calcule la distancia real
        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }

        // 2. Llamada REAL al endpoint que acabamos de crear
        // (Esto hará un fetch a /api/restaurants con tus filtros)
        const data: ApiRestaurant[] = await getRestaurants(params);

        // 3. Adaptamos los datos para el mapa
        const adapted: MapRestaurant[] = data.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          rating: r.rating,
          hours: `${r.openTime} - ${r.closeTime}`,
          // Aquí ya viene la distancia calculada por tu backend
          distance:
            typeof r.distanceKm === "number"
              ? `${r.distanceKm.toFixed(1)} km`
              : "—",
          coordinates: [r.lng, r.lat],
        }));

        if (adapted.length > 0) {
          setRestaurants(adapted);
        } else {
          // Opcional: Si la búsqueda no trae nada, vaciamos la lista
          setRestaurants([]);
        }
      } catch (err) {
        console.error("Error cargando restaurantes:", err);
        // Ya no usamos mock, queremos ver si falla la API real
      } finally {
        setLoading(false);
      }
    }

    load();
    // OJO: Agregamos estas dependencias para que se recargue al cambiar algo
  }, [search, selectedCategory, userLocation]);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || r.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const selected = restaurants.find((r) => r.id === selectedRestaurant) || null;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">ReservaYa</h2>
          <UserMenu
            isLoggedIn={true}
            onLogin={() => {}}
            onRegister={() => {}}
            onViewFavorites={onViewFavorites}
            onViewReservations={onViewReservations}
            onLogout={onLogout}
          />
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar restaurantes, cafeterías..."
            className="pl-12 h-12 bg-white border-0 rounded-xl shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Filtros y ubicación */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {/* Botón ubicación */}
        <button
          onClick={handleGetLocation}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-700 text-sm shadow-md hover:bg-orange-50"
        >
          <MapPin className="h-4 w-4 text-orange-500" />
          {isLocating ? "Obteniendo ubicación..." : "Obtener mi ubicación"}
        </button>

        {/* Chips de categoría */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Todos" },
            { id: "Restaurante", label: "Restaurante" },
            { id: "Restobar", label: "Restobar" },
            { id: "Cafetería", label: "Cafetería" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-white text-orange-600 border-orange-400 shadow-md"
                  : "bg-white/80 text-slate-700 border-transparent hover:bg-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {locationError && (
        <p className="mt-2 text-xs text-red-100">{locationError}</p>
      )}

      {/* Map Area */}
      <div className="relative h-[calc(100vh-180px)]">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: filteredRestaurants[0]?.coordinates[0] ?? -77.0428,
            latitude: filteredRestaurants[0]?.coordinates[1] ?? -12.0464,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {filteredRestaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              longitude={restaurant.coordinates[0]}
              latitude={restaurant.coordinates[1]}
              anchor="bottom"
            >
              <button
                onClick={() => {
                  onSelectRestaurant(
                    selectedRestaurant === restaurant.id ? null : restaurant.id
                  );
                  setPopupInfo(restaurant);
                }}
                className="transition-all duration-300 hover:scale-110"
              >
                <div
                  className={`relative ${
                    selectedRestaurant === restaurant.id ? "scale-125" : ""
                  } transition-transform duration-300`}
                >
                  <MapPin
                    className={`h-12 w-12 ${
                      selectedRestaurant === restaurant.id
                        ? "fill-orange-500 text-orange-600"
                        : "fill-red-500 text-red-600"
                    } drop-shadow-lg`}
                  />
                  <UtensilsCrossed className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-5 text-white" />
                </div>
              </button>
            </Marker>
          ))}
          {/* Marcador de ubicación del usuario */}
          {userLocation && (
            <Marker
              longitude={userLocation.lng}
              latitude={userLocation.lat}
              anchor="center"
            >
              <span className="relative flex h-6 w-6">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-blue-500 border-2 border-white shadow-lg"></span>
              </span>
            </Marker>
          )}

          {popupInfo && (
            <Popup
              longitude={popupInfo.coordinates[0]}
              latitude={popupInfo.coordinates[1]}
              anchor="top"
              onClose={() => setPopupInfo(null)}
              closeButton={false}
              className="restaurant-popup"
            >
              {/* ... */}
            </Popup>
          )}

          {popupInfo && (
            <Popup
              longitude={popupInfo.coordinates[0]}
              latitude={popupInfo.coordinates[1]}
              anchor="top"
              onClose={() => setPopupInfo(null)}
              closeButton={false}
              className="restaurant-popup"
            >
              <div className="p-2">
                <h3 className="font-bold text-sm">{popupInfo.name}</h3>
                <p className="text-xs text-slate-600">{popupInfo.type}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{popupInfo.rating}</span>
                </div>
              </div>
            </Popup>
          )}
        </Map>

        {/* Info Card */}
        {selected && (
          <div className="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="bg-white border-4 border-orange-200 shadow-2xl rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-slate-800 mb-1">{selected.name}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white border-0">
                        {selected.type}
                      </Badge>
                      <span className="text-slate-500">
                        • {selected.distance}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleFavorite(selected.id)}
                      className={`p-2 rounded-full transition-all ${
                        favorites.includes(selected.id)
                          ? "text-red-500 hover:bg-red-50"
                          : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          favorites.includes(selected.id) ? "fill-red-500" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onSelectRestaurant(null)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-slate-700">{selected.rating}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span>{selected.hours}</span>
                  </div>
                </div>

                <Button
                  onClick={onViewDetails}
                  className="w-full h-11 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
                >
                  Ver Menú y Reservar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom indicator */}
      <div className="bg-white px-6 py-3 flex items-center justify-center gap-2 border-t-2 border-orange-100">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-slate-600">
          {loading
            ? "Cargando restaurantes..."
            : `${filteredRestaurants.length} restaurantes cerca de ti`}
        </span>
      </div>
    </div>
  );
}
