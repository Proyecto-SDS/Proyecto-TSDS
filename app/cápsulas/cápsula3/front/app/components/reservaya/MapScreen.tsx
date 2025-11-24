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

// Imports de Mapbox (TUYO)
import Map, { Marker, Popup, MapRef } from "react-map-gl";
import { useEffect, useState, useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";

// Imports de API (TUYO)
// Eliminado client.ts. Usamos fetch directo a Flask backend

type RestaurantType = "Restaurante" | "Restobar" | "Cafetería";
interface ApiRestaurant {
  id: number;
  nombre?: string;
  name?: string;
  tipo?: string;
  type?: string;
  latitud?: number;
  lat?: number;
  longitud?: number;
  lng?: number;
  rating?: number | string;
  direccion?: string;
  address?: string;
  hora_apertura?: string;
  open_time?: string;
  hora_cierre?: string;
  close_time?: string;
  distancia_km?: number | string;
  distance_km?: number | string;
}

// Definimos la interfaz localmente o la importamos
interface MapRestaurant {
  id: number;
  name: string;
  type: string;
  rating: number;
  hours: string;
  distance: string;
  coordinates: [number, number]; // [lng, lat]
}

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
  // Estas props venían de Benja, las dejamos opcionales para no romper nada
  // pero usaremos estado local para controlar la búsqueda real
  searchTerm,
  onSearchChange,
  searchResults,
}: {
  selectedRestaurant: number | null;
  onSelectRestaurant: (id: number | null) => void;
  onViewDetails: () => void;
  onViewFavorites: () => void;
  onViewReservations: () => void;
  onLogout: () => void;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchResults?: any[];
}) {
  // --- ESTADOS (Mantenemos TU lógica para conectar con Backend) ---
  const [restaurants, setRestaurants] = useState<MapRestaurant[]>([]);
  const [popupInfo, setPopupInfo] = useState<MapRestaurant | null>(null);
  const mapRef = useRef<MapRef>(null);

  // Estado para el buscador y filtros
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "Restaurante" | "Restobar" | "Cafetería"
  >("all");

  // Estado para ubicación
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- LÓGICA DE GEOLOCALIZACIÓN (TUYA) ---
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
        setLocationError("No pudimos obtener tu ubicación.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Obtener ubicación al inicio
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
        (err) => setIsLocating(false),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  // Volar a la ubicación del usuario
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 2000,
      });
    }
  }, [userLocation]);

  // --- LÓGICA DE CARGA DE DATOS (UNIFICADA) ---
  // Aquí unimos tu backend con el buscador de Benja
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // Preparamos parámetros para el Backend Real
        const params: any = {};

        // Usamos el estado 'search' local
        if (search) params.search = search;
        if (selectedCategory !== "all") params.category = selectedCategory;

        // Enviamos ubicación para calcular distancia
        if (userLocation) {
          params.lat = userLocation.lat;
          params.lng = userLocation.lng;
        }

        // LLAMADA AL BACKEND REAL
        // --- FETCH DIRECTO AL BACKEND ---
        const API_BASE = "http://localhost:5000";
        let endpoint = "/api/locales";
        const query = new URLSearchParams();
        if (search) {
          endpoint = "/api/search";
          query.set("q", search);
        }
        if (selectedCategory !== "all") query.set("tipo", selectedCategory);
        if (userLocation) {
          query.set("lat", String(userLocation.lat));
          query.set("lng", String(userLocation.lng));
        }
        const qs = query.toString();
        const url = qs ? `${API_BASE}${endpoint}?${qs}` : `${API_BASE}${endpoint}`;
        let data: ApiRestaurant[] = [];
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`API error ${res.status}`);
          data = await res.json();
        } catch (err) {
          console.error("Error en fetch:", err);
          data = [];
        }

        // Adaptamos los datos para el mapa
        const adapted: MapRestaurant[] = data.map((r) => ({
          id: r.id,
          name: r.nombre || r.name || "Sin Nombre",
          type: r.tipo || r.type || "Restaurante",
          rating: parseFloat(String(r.rating ?? "4.5")),
          hours: `${r.hora_apertura || r.open_time || "09:00"} - ${r.hora_cierre || r.close_time || "22:00"}`,
          distance:
            typeof r.distancia_km === "number"
              ? `${r.distancia_km.toFixed(1)} km`
              : typeof r.distance_km === "number"
              ? `${r.distance_km.toFixed(1)} km`
              : "—",
          coordinates: [
            parseFloat(String(r.longitud ?? r.lng ?? "-70.6551")),
            parseFloat(String(r.latitud ?? r.lat ?? "-33.1836")),
          ],
        }));

        setRestaurants(adapted);
      } catch (err) {
        console.error("Error cargando restaurantes:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [search, selectedCategory, userLocation]); // Se recarga si cambia búsqueda, categoría o ubicación

  // Encontramos el restaurante seleccionado de la lista actual
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

        {/* Search Bar (Estilo de Benja, Lógica Tuya) */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar restaurantes, cafeterías..."
            className="pl-12 pr-10 h-12 bg-white border-0 rounded-xl shadow-md"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Botón X para limpiar (De Benja) */}
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm"
            >
              X
            </button>
          )}

          {/* Lista de resultados de búsqueda */}
          {search && restaurants.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-y-auto z-50">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => {
                    onSelectRestaurant(restaurant.id);
                    setPopupInfo(restaurant);
                    // Volar al restaurante en el mapa
                    if (mapRef.current) {
                      mapRef.current.flyTo({
                        center: restaurant.coordinates,
                        zoom: 15,
                        duration: 1500,
                      });
                    }
                  }}
                  className="w-full px-4 py-3 hover:bg-orange-50 transition-colors border-b border-slate-100 last:border-b-0 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 truncate">
                        {restaurant.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-orange-100 text-orange-700 border-0 text-xs">
                          {restaurant.type}
                        </Badge>
                        {restaurant.distance && restaurant.distance !== "—" && (
                          <span className="text-xs text-slate-500">
                            {restaurant.distance}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-slate-600">
                          {restaurant.rating}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          {restaurant.hours}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay resultados */}
          {search && restaurants.length === 0 && !loading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-6 text-center z-50">
              <div className="text-slate-400 mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-slate-600 font-medium">
                No se encontraron resultados
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Intenta con otro término de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filtros y Herramientas */}
      <div className="mt-4 px-4 flex flex-col gap-3">
        {/* Fila superior: Botón ubicación y Limpiar Filtros */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleGetLocation}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-700 text-sm shadow-md hover:bg-orange-50"
          >
            <MapPin className="h-4 w-4 text-orange-500" />
            {isLocating ? "..." : "Mi ubicación"}
          </button>

          {selectedCategory !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 text-orange-600 border border-orange-300 hover:bg-white transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

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
        <p className="px-4 mt-2 text-xs text-red-500">{locationError}</p>
      )}

      {/* Map Area (TUYO - Usando Mapbox Real) */}
      <div className="relative h-[calc(100vh-220px)] mt-4">
        <Map
          ref={mapRef}
          mapboxAccessToken={MAPBOX_TOKEN}
          initialViewState={{
            longitude: -77.0428, // Default Lima
            latitude: -12.0464,
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {restaurants.map((restaurant) => (
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

          {/* Tu marcador de ubicación */}
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

        {/* Info Card del Restaurante Seleccionado */}
        {selected && (
          <div className="absolute bottom-6 left-6 right-6 animate-in slide-in-from-bottom-4 duration-300 z-10">
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
                    {/* Botón cerrar selección */}
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
            ? "Buscando locales..."
            : `${restaurants.length} locales encontrados`}
        </span>
      </div>
    </div>
  );
}
