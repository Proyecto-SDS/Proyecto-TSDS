import {
  MapPin,
  Search,
  Star,
  Clock,
  UtensilsCrossed,
  Heart,
  Coffee,
  Wine,
  ChefHat,
} from "lucide-react";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { UserMenu } from "./UserMenu";
import { useState } from "react";

interface Restaurant {
  id: number;
  name: string;
  type: string;
  rating: number;
  hours: string;
  distance: string;
  position: { top: string; left: string };
}

const restaurants: Restaurant[] = [
  {
    id: 1,
    name: "King Halo",
    type: "Restaurante",
    rating: 4.8,
    hours: "11:00 AM - 10:00 PM",
    distance: "0.5 km",
    position: { top: "45%", left: "48%" },
  },
  {
    id: 2,
    name: "La Paella Real",
    type: "Restobar",
    rating: 4.6,
    hours: "12:00 PM - 11:00 PM",
    distance: "1.2 km",
    position: { top: "32%", left: "62%" },
  },
  {
    id: 3,
    name: "Café del Mar",
    type: "Cafetería",
    rating: 4.9,
    hours: "8:00 AM - 8:00 PM",
    distance: "0.8 km",
    position: { top: "58%", left: "38%" },
  },
  {
    id: 4,
    name: "El Cóndor Pasa",
    type: "Restaurante",
    rating: 4.7,
    hours: "12:00 PM - 10:00 PM",
    distance: "0.6 km",
    position: { top: "25%", left: "45%" },
  },
  {
    id: 5,
    name: "Manhattan Caffe",
    type: "Cafetería",
    rating: 4.8,
    hours: "7:00 AM - 9:00 PM",
    distance: "0.9 km",
    position: { top: "65%", left: "55%" },
  },
];

type CategoryFilter = "Todos" | "Restaurante" | "Restobar" | "Cafetería";

export function MapScreen({
  selectedRestaurant,
  onSelectRestaurant,
  onViewDetails,
  onViewFavorites,
  onViewReservations,
  onLogin,
  onRegister,
  onLogout,
  isLoggedIn,
  favorites,
  onToggleFavorite,
}: {
  selectedRestaurant: number | null;
  onSelectRestaurant: (id: number | null) => void;
  onViewDetails: () => void;
  onViewFavorites: () => void;
  onViewReservations: () => void;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Todos");

  const selected = restaurants.find((r) => r.id === selectedRestaurant);

  // Filtrar restaurantes según la categoría seleccionada
  const filteredRestaurants =
    selectedCategory === "Todos"
      ? restaurants
      : restaurants.filter((r) => r.type === selectedCategory);

  const categoryFilters: { label: CategoryFilter; icon: React.ReactNode }[] = [
    { label: "Todos", icon: <UtensilsCrossed className="h-5 w-5" /> },
    { label: "Restaurante", icon: <ChefHat className="h-5 w-5" /> },
    { label: "Restobar", icon: <Wine className="h-5 w-5" /> },
    { label: "Cafetería", icon: <Coffee className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white">ReservaYa</h2>
          <UserMenu
            isLoggedIn={isLoggedIn}
            onLogin={onLogin}
            onRegister={onRegister}
            onViewFavorites={onViewFavorites}
            onViewReservations={onViewReservations}
            onLogout={onLogout}
          />
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar restaurantes, cafeterías..."
            className="pl-12 h-12 bg-white border-0 rounded-xl shadow-md"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categoryFilters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => setSelectedCategory(filter.label)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${
                selectedCategory === filter.label
                  ? "bg-white text-orange-600 shadow-md border-2 border-orange-300"
                  : "bg-white/20 text-white border-2 border-white/30 hover:bg-white/30"
              }`}
            >
              {filter.icon}
              <span className="text-sm">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map Area */}
      <div className="relative h-[calc(100vh-230px)] bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
        {/* Map grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern
              id="map-grid"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#27AE60"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>

        {/* Streets */}
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1="0"
            y1="40%"
            x2="100%"
            y2="45%"
            stroke="#94A3B8"
            strokeWidth="8"
            opacity="0.3"
          />
          <line
            x1="0"
            y1="60%"
            x2="100%"
            y2="58%"
            stroke="#94A3B8"
            strokeWidth="6"
            opacity="0.3"
          />
          <line
            x1="45%"
            y1="0"
            x2="48%"
            y2="100%"
            stroke="#94A3B8"
            strokeWidth="10"
            opacity="0.3"
          />
          <line
            x1="70%"
            y1="0"
            x2="65%"
            y2="100%"
            stroke="#94A3B8"
            strokeWidth="7"
            opacity="0.3"
          />
        </svg>

        {/* Restaurant Pins */}
        {filteredRestaurants.map((restaurant) => (
          <button
            key={restaurant.id}
            onClick={() =>
              onSelectRestaurant(
                selectedRestaurant === restaurant.id ? null : restaurant.id
              )
            }
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 hover:scale-110"
            style={restaurant.position}
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
        ))}

        {/* User Location */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="h-16 w-16 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
              <div className="h-3 w-3 bg-white rounded-full"></div>
            </div>
            <div className="absolute inset-0 h-16 w-16 bg-blue-400 rounded-full animate-ping opacity-30"></div>
          </div>
        </div>

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
          {filteredRestaurants.length}{" "}
          {selectedCategory === "Todos"
            ? "restaurantes"
            : selectedCategory.toLowerCase() + "s"}{" "}
          cerca de ti
        </span>
      </div>
    </div>
  );
}
