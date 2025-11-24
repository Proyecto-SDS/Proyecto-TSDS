import {
  User,
  Heart,
  LogOut,
  Settings,
  Calendar,
  LogIn,
  UserPlus,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface UserMenuProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onViewFavorites: () => void;
  onViewReservations: () => void;
  onLogout: () => void;
}

export function UserMenu({
  isLoggedIn,
  onLogin,
  onRegister,
  onViewFavorites,
  onViewReservations,
  onLogout,
}: UserMenuProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 rounded-full h-14 w-14 border-2 border-white/40 shadow-lg hover:scale-105 transition-transform"
        >
          <User className="h-7 w-7" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white border-l-4 border-orange-300">
        {isLoggedIn ? (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-4 mt-2">
                <Avatar className="h-16 w-16 border-4 border-orange-200">
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-400 text-white">
                    JP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle className="text-slate-800">Juan Pérez</SheetTitle>
                  <SheetDescription className="text-slate-600 mt-1">
                    juan@email.com
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-2">
              {/* Favoritos */}
              <button
                onClick={onViewFavorites}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors border-2 border-transparent hover:border-orange-200"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-slate-800">Mis Favoritos</h4>
                  <p className="text-slate-500">Restaurantes guardados</p>
                </div>
              </button>

              {/* Mis Reservas */}
              <button
                onClick={onViewReservations}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors border-2 border-transparent hover:border-orange-200"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-slate-800">Mis Reservas</h4>
                  <p className="text-slate-500">Reservas realizadas</p>
                </div>
              </button>

              {/* Configuración */}
              <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-orange-50 transition-colors border-2 border-transparent hover:border-orange-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-slate-800">Configuración</h4>
                  <p className="text-slate-500">Ajustes de cuenta</p>
                </div>
              </button>

              <Separator className="my-4 bg-orange-100" />

              {/* Cerrar Sesión */}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-red-50 transition-colors border-2 border-transparent hover:border-red-200"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-red-700">Cerrar Sesión</h4>
                  <p className="text-slate-500">Salir de tu cuenta</p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-4 mt-2">
                <div className="h-16 w-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-slate-800">
                    ¡Bienvenido!
                  </SheetTitle>
                  <SheetDescription className="text-slate-600 mt-1">
                    Inicia sesión para acceder a todas las funciones
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="space-y-3">
              {/* Iniciar Sesión */}
              <button
                onClick={onLogin}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all shadow-lg border-2 border-transparent"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-white">Iniciar Sesión</h4>
                  <p className="text-white/80">Accede a tu cuenta</p>
                </div>
              </button>

              {/* Crear Cuenta */}
              <button
                onClick={onRegister}
                className="w-full flex items-center gap-4 p-5 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors border-2 border-orange-200 hover:border-orange-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-slate-800">Crear Cuenta</h4>
                  <p className="text-slate-500">Regístrate gratis</p>
                </div>
              </button>

              <Separator className="my-4 bg-orange-100" />

              {/* Información de beneficios */}
              <div className="bg-amber-50 rounded-xl p-4 border-2 border-amber-200">
                <h4 className="text-slate-800 mb-2">¿Por qué registrarte?</h4>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Guarda tus favoritos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span>Gestiona tus reservas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-500" />
                    <span>Personaliza tu experiencia</span>
                  </li>
                </ul>
              </div>
            </div>
          </>
        )}

        {/* App Version */}
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-slate-400 text-center">ReservaYa v1.0.0</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
