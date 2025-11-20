// components/reservaya/AppReservaYa.tsx
"use client";

import { useState } from "react";

import { LoginScreen } from "./LoginScreen";
import { RegisterScreen } from "./RegisterScreen";
import { MapScreen } from "./MapScreen";
import { RestaurantDetails } from "./RestaurantDetails";
import { QRConfirmation } from "./QRConfirmation";
import { FavoritesScreen } from "./FavoritesScreen";
import { ReservationsScreen, type Reservation } from "./ReservationsScreen";
import { Toaster } from "./ui/sonner";
import { Restaurant } from "./ui/restaurantTypes";

const MOCK_RESTAURANTS: Restaurant[] = [{
      id: 1,
      name: "King Halo",
      type: "Restaurante",
      rating: 4.8,
      hours: "11:00 AM - 10:00 PM",
      distance: "0.5 km",
      address: "Av. Principal 123, Centro",
      position: {
        top: "40%",
        left: "30%",
      },
},
      {
    id: 2,
    name: "La Paella Real",
    type: "Restaurante",
    rating: 4.6,
    hours: "12:00 PM - 11:00 PM",
    distance: "1.2 km",
    address: "Calle España 456, Miraflores",
    position: {
      top: "55%",
      left: "25%",
    },
  },
  {
    id: 3,
    name: "Café Central",
    type: "Cafetería",
    rating: 4.4,
    hours: "8:00 AM - 8:00 PM",
    distance: "0.8 km",
    address: "Jr. Lima 789, Centro",
    position: {
      top: "35%",
      left: "60%",
    },
  },
];



type Screen =
  | "login"
  | "register"
  | "map"
  | "details"
  | "qr"
  | "favorites"
  | "reservations";

export default function AppReservaYa() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("map");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(
    null
  );
  const [favorites, setFavorites] = useState<number[]>([1]); // King Halo favorito por defecto
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentReservationData, setCurrentReservationData] = useState<{
    restaurantName: string;
    date: string;
    time: string;
    guests: number;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [results, setResults] = useState<Restaurant[]>(MOCK_RESTAURANTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  async function applyFilters(termFromInput: string) {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      const cleanedTerm = termFromInput.trim();
      if (cleanedTerm !== "") {
        // el backend usa 'q' para nombre/comuna
        params.set("q", cleanedTerm);
      }

      // Filtrar también por categoría con el back:
      if (selectedCategories.length > 0) {
        params.set("categoria", selectedCategories[0]);
      }

      const response = await fetch(
        `/api/locales/buscar?${params.toString()}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();

      // Adaptamos lo que viene del back al tipo Restaurant del front
      const adapted: Restaurant[] = data.map((local: any) => ({
        id: local.id,
        name: local.nombre,
        type: selectedCategories[0] || "Restaurante", 
        address: local.comuna,
        rating: 4.5,          
        distance: "0.5 km",   
        priceRange: "$$",     
        isOpen: true,         
        position: {
          top: "50%",         
          left: "50%",
        },
      }));

      setResults(adapted);
    } catch (e) {
      console.error("Error al obtener locales", e);
      setError("No se pudieron cargar los locales. Intenta nuevamente.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }
  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const saveReservation = () => {
    if (currentReservationData) {
      const newReservation: Reservation = {
        id: Date.now().toString(),
        restaurantName: currentReservationData.restaurantName,
        date: currentReservationData.date,
        time: currentReservationData.time,
        guests: currentReservationData.guests,
        items: currentReservationData.items,
        total: currentReservationData.total,
        status: "confirmed",
      };
      setReservations((prev) => [newReservation, ...prev]);
      setCurrentReservationData(null);
    }
  };

  return (
    <>
      <div className="min-h-screen">
        {currentScreen === "login" && (
          <LoginScreen
            onLogin={() => {
              setIsLoggedIn(true);
              setCurrentScreen("map");
            }}
            onCreateAccount={() => setCurrentScreen("register")}
          />
        )}

        {currentScreen === "register" && (
          <RegisterScreen
            onRegister={() => {
              setIsLoggedIn(true);
              setCurrentScreen("map");
            }}
            onBackToLogin={() => setCurrentScreen("login")}
          />
        )}

        {currentScreen === "map" && (
          <MapScreen
            selectedRestaurant={selectedRestaurant}
            onSelectRestaurant={setSelectedRestaurant}
            onViewDetails={() => setCurrentScreen("details")}
            onViewFavorites={() => setCurrentScreen("favorites")}
            onViewReservations={() => setCurrentScreen("reservations")}
            onLogin={() => setCurrentScreen("login")}
            onRegister={() => setCurrentScreen("register")}
            onLogout={() => {
              setIsLoggedIn(false);
              setCurrentScreen("map");
            }}
            isLoggedIn={isLoggedIn}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              applyFilters(value);
            }}
            searchResults={results}
          />
          
         
        )}

        {currentScreen === "favorites" && (
          <FavoritesScreen
            onBack={() => setCurrentScreen("map")}
            onSelectRestaurant={(id) => {
              setSelectedRestaurant(id);
              setCurrentScreen("details");
            }}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentScreen === "details" && (
          <RestaurantDetails
            onBack={() => setCurrentScreen("map")}
            onShowQR={(reservationData) => {
              setCurrentReservationData(reservationData);
              setCurrentScreen("qr");
            }}
            selectedRestaurantId={selectedRestaurant}
            isLoggedIn={isLoggedIn}
            onLogin={() => setCurrentScreen("login")}
            onRegister={() => setCurrentScreen("register")}
          />
        )}

        {currentScreen === "reservations" && (
          <ReservationsScreen
            onBack={() => setCurrentScreen("map")}
            reservations={reservations}
          />
        )}

        {currentScreen === "qr" && currentReservationData && (
          <QRConfirmation
            reservationData={currentReservationData}
            onBackToMap={() => {
              saveReservation();
              setCurrentScreen("map");
              setSelectedRestaurant(null);
            }}
          />
        )}
      </div>

      <Toaster position="top-center" richColors />
    </>
  );
}
