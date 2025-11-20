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

  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };
  const handleLogout = () => {
    // Aquí después puedes limpiar sesión, ir al login, etc.
    console.log("Logout clickeado");
    // Por ejemplo: setCurrentScreen("map");
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
            onLogout={handleLogout}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
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
