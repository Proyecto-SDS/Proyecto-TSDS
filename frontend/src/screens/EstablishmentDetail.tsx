'use client';

import { ArrowLeft, Calendar, Check, ChevronLeft, ChevronRight, Heart, MapPin, Phone, Star, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RatingBadge } from '../components/badges/RatingBadge';
import { StatusBadge } from '../components/badges/StatusBadge';
import { TypeBadge } from '../components/badges/TypeBadge';
import { PrimaryButton } from '../components/buttons/PrimaryButton';
import { SecondaryButton } from '../components/buttons/SecondaryButton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { TabNavigation } from '../components/navigation/TabNavigation';
import { useAuth } from '../context/AuthContext';
import type { Establishment, Rating, TabItem } from '../types';
import { formatPhoneNumber, getRelativeTime } from '../utils/formatters';

// Mock data
const MOCK_ESTABLISHMENT: Establishment = {
  id: '1',
  name: 'La Buena Mesa',
  type: 'Restaurante',
  address: 'Av. Providencia 1234',
  commune: 'Providencia',
  phone: '+56912345678',
  email: 'contacto@labuena.cl',
  description: 'Restaurante de comida mediterránea con ambiente acogedor y una carta variada. Especialidad en pastas artesanales y carnes a la parrilla.',
  image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
  rating: 4.7,
  reviewCount: 128,
  status: 'open',
  closingTime: '23:00',
};

const MOCK_HOURS = [
  { day: 'Lunes', open: '11:00', close: '23:00', isOpen: true },
  { day: 'Martes', open: '11:00', close: '23:00', isOpen: true },
  { day: 'Miércoles', open: '11:00', close: '23:00', isOpen: true },
  { day: 'Jueves', open: '11:00', close: '23:00', isOpen: true },
  { day: 'Viernes', open: '11:00', close: '01:00', isOpen: true },
  { day: 'Sábado', open: '12:00', close: '01:00', isOpen: true },
  { day: 'Domingo', open: '12:00', close: '22:00', isOpen: false },
];

const MOCK_PHOTOS = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
];

const MOCK_MENU_ITEMS = [
  {
    id: '1',
    category: 'Entradas',
    name: 'Bruschetta Clásica',
    description: 'Pan tostado con tomate fresco, albahaca y aceite de oliva',
    price: 4500,
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
    available: true,
  },
  {
    id: '2',
    category: 'Entradas',
    name: 'Tabla de Quesos',
    description: 'Selección de quesos artesanales con mermeladas y frutos secos',
    price: 7800,
    available: true,
  },
  {
    id: '3',
    category: 'Platos Principales',
    name: 'Pasta Carbonara',
    description: 'Fettuccine con salsa cremosa de huevo, panceta y queso parmesano',
    price: 8900,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
    available: true,
  },
  {
    id: '4',
    category: 'Platos Principales',
    name: 'Bife de Chorizo',
    description: '300g de carne a la parrilla con papas rústicas y ensalada',
    price: 12500,
    available: false,
  },
  {
    id: '5',
    category: 'Platos Principales',
    name: 'Risotto de Hongos',
    description: 'Arroz cremoso con hongos portobello y trufa',
    price: 9500,
    available: true,
  },
  {
    id: '6',
    category: 'Bebidas',
    name: 'Vino Tinto Reserva',
    description: 'Copa de vino tinto chileno',
    price: 3500,
    available: true,
  },
  {
    id: '7',
    category: 'Postres',
    name: 'Tiramisú',
    description: 'Clásico postre italiano con café y mascarpone',
    price: 4200,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    available: true,
  },
];

const MOCK_OPINIONS: Rating[] = [
  {
    id: '1',
    establishmentId: '1',
    userId: '101',
    userName: 'María González',
    userAvatar: 'https://i.pravatar.cc/150?u=maria',
    rating: 5,
    comment: 'Excelente experiencia! La pasta carbonara estaba deliciosa y el servicio fue muy atento. Definitivamente volveré.',
    date: '2024-11-20T19:30:00',
  },
  {
    id: '2',
    establishmentId: '1',
    userId: '102',
    userName: 'Carlos Rodríguez',
    rating: 4,
    comment: 'Muy buen restaurante, ambiente agradable y comida de calidad. Solo el tiempo de espera fue un poco largo.',
    date: '2024-11-18T20:15:00',
  },
  {
    id: '3',
    establishmentId: '1',
    userId: '103',
    userName: 'Ana Martínez',
    userAvatar: 'https://i.pravatar.cc/150?u=ana',
    rating: 5,
    comment: 'Increíble! La mejor pasta que he probado en Santiago. El tiramisú también espectacular.',
    date: '2024-11-15T21:00:00',
  },
];

const MOCK_TABLES = [
  { id: 't1', name: 'Mesa 1', capacity: 2, status: 'disponible' },
  { id: 't2', name: 'Mesa 2', capacity: 4, status: 'disponible' },
  { id: 't3', name: 'Mesa Terraza', capacity: 6, status: 'disponible' },
  { id: 't4', name: 'Mesa 4', capacity: 4, status: 'reservada' },
];

const TIME_SLOTS = [
  '19:00', '19:15', '19:30', '19:45',
  '20:00', '20:15', '20:30', '20:45',
  '21:00', '21:15', '21:30', '21:45',
  '22:00', '22:15', '22:30',
];

// Header Component
function EstablishmentHeader({ establishment, onBack, isFavorite, onToggleFavorite }: any) {
  return (
    <div className="relative h-[300px] overflow-hidden">
      <ImageWithFallback
        src={establishment.image}
        alt={establishment.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-4 left-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        aria-label="Volver"
      >
        <ArrowLeft size={24} className="text-[#334155]" />
      </button>

      {/* Favorite button */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart
          size={24}
          className={isFavorite ? 'text-[#EF4444] fill-[#EF4444]' : 'text-[#334155]'}
        />
      </button>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="mb-2">
          <TypeBadge type={establishment.type} />
        </div>
        <h1 className="text-white mb-2">{establishment.name}</h1>
        <RatingBadge rating={establishment.rating} reviewCount={establishment.reviewCount} />
      </div>
    </div>
  );
}

// Quick Info Bar Component
function QuickInfoBar({ establishment, onReserveClick, isLoggedIn }: any) {
  return (
    <div className="sticky top-16 z-40 bg-white border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <RatingBadge rating={establishment.rating} reviewCount={establishment.reviewCount} />
            <StatusBadge status={establishment.status} closingTime={establishment.closingTime} />
            <div className="flex items-center gap-1 text-sm text-[#64748B]">
              <MapPin size={16} />
              <span>{establishment.address}, {establishment.commune}</span>
            </div>
          </div>
          {isLoggedIn && (
            <PrimaryButton size="md" onClick={onReserveClick}>
              Reservar mesa
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
}

// Tab 1: Información
function InformacionTab({ establishment, hours, photos }: any) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* Description */}
      {establishment.description && (
        <section>
          <h2 className="text-[#334155] mb-3">Acerca de</h2>
          <p className="text-[#64748B]">{establishment.description}</p>
        </section>
      )}

      {/* Contact Info */}
      <section>
        <h2 className="text-[#334155] mb-3">Información de contacto</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin size={20} className="text-[#F97316]" />
            <span className="text-[#64748B]">{establishment.address}, {establishment.commune}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-[#F97316]" />
            <a href={`tel:${establishment.phone}`} className="text-[#3B82F6] hover:underline">
              {formatPhoneNumber(establishment.phone)}
            </a>
            <a
              href={`https://wa.me/${establishment.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#22C55E] hover:underline text-sm"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Hours */}
      <section>
        <h2 className="text-[#334155] mb-3">Horarios</h2>
        <div className="space-y-2">
          {hours.map((hour: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-[#E2E8F0] last:border-0">
              <span className="text-[#334155]">{hour.day}</span>
              <span className={hour.isOpen ? 'text-[#64748B]' : 'text-[#EF4444]'}>
                {hour.isOpen ? `${hour.open} - ${hour.close}` : 'Cerrado'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Photo Gallery */}
      <section>
        <h2 className="text-[#334155] mb-3">Fotos</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedPhoto(photo)}
              className="aspect-square rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
            >
              <ImageWithFallback src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </section>

      {/* Full-screen photo viewer */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            aria-label="Cerrar"
          >
            ×
          </button>
          <ImageWithFallback src={selectedPhoto} alt="Foto ampliada" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}

// Tab 2: Menú
function MenuTab({ menuItems }: any) {
  const categories = Array.from(new Set(menuItems.map((item: any) => item.category))) as string[];

  return (
    <div className="space-y-8">
      <h2 className="text-[#334155]">Menú</h2>
      
      {categories.map((category: string) => (
        <section key={category}>
          <h3 className="text-[#334155] mb-4">{category}</h3>
          <div className="space-y-4">
            {menuItems
              .filter((item: any) => item.category === category)
              .map((item: any) => (
                <div key={item.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex gap-4">
                  {item.image && (
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden">
                      <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-[#334155]">{item.name}</h4>
                      <span className="text-[#F97316]">${item.price.toLocaleString('es-CL')}</span>
                    </div>
                    <p className="text-sm text-[#64748B] mb-2">{item.description}</p>
                    <span className={`text-xs px-2 py-1 rounded ${item.available ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#94A3B8]/10 text-[#94A3B8]'}`}>
                      {item.available ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// Tab 3: Opiniones
function OpinionesTab({ 
  opinions, 
  currentUserOpinion, 
  isLoggedIn,
  onSubmitOpinion,
  onLoginClick 
}: any) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const opinionsPerPage = 5;

  const avgRating = opinions.reduce((sum: number, op: any) => sum + op.rating, 0) / opinions.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => 
    opinions.filter((op: any) => op.rating === stars).length
  );

  const handleSubmit = () => {
    if (comment.length >= 20 && rating > 0) {
      onSubmitOpinion({ rating, comment });
      setRating(0);
      setComment('');
    }
  };

  const totalPages = Math.ceil((opinions.length - (currentUserOpinion ? 1 : 0)) / opinionsPerPage);
  const startIndex = (currentPage - 1) * opinionsPerPage;
  const displayedOpinions = opinions
    .filter((op: any) => op.id !== currentUserOpinion?.id)
    .slice(startIndex, startIndex + opinionsPerPage);

  return (
    <div className="space-y-8">
      <h2 className="text-[#334155]">Opiniones</h2>

      {/* Rating Summary */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="text-center md:text-left">
            <div className="text-4xl mb-2">{avgRating.toFixed(1)}</div>
            <RatingBadge rating={avgRating} reviewCount={opinions.length} />
          </div>
          <div className="flex-1 space-y-2">
            {ratingDistribution.map((count, index) => {
              const stars = 5 - index;
              const percentage = opinions.length > 0 ? (count / opinions.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm text-[#64748B] w-12">{stars} ⭐</span>
                  <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#22C55E]" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-[#64748B] w-8">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User's Opinion Input or Existing Opinion */}
      {!isLoggedIn ? (
        <div className="bg-[#F1F5F9] rounded-xl p-6 text-center">
          <p className="text-[#64748B] mb-4">Inicia sesión para escribir una opinión</p>
          <PrimaryButton onClick={onLoginClick}>Iniciar sesión</PrimaryButton>
        </div>
      ) : currentUserOpinion ? (
        <div className="bg-white rounded-xl border-4 border-[#F97316] p-6">
          <p className="text-sm text-[#64748B] mb-2">Tu opinión</p>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white">
              {currentUserOpinion.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h4 className="text-[#334155] mb-1">{currentUserOpinion.userName}</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= currentUserOpinion.rating ? 'fill-[#F97316] text-[#F97316]' : 'text-[#E2E8F0]'}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#64748B]">{getRelativeTime(currentUserOpinion.date)}</span>
              </div>
              <p className="text-[#64748B]">{currentUserOpinion.comment}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <h3 className="text-[#334155] mb-4">¿Cuál fue tu experiencia?</h3>
          
          {/* Star Rating */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= (hoverRating || rating)
                      ? 'fill-[#F97316] text-[#F97316]'
                      : 'text-[#E2E8F0]'
                  }
                />
              </button>
            ))}
          </div>

          {/* Comment Input */}
          <div className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Mínimo 20 caracteres, máximo 500"
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-xl resize-none focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
              rows={4}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-[#64748B]">{comment.length}/500</span>
              {comment.length < 20 && comment.length > 0 && (
                <span className="text-sm text-[#EF4444]">Mínimo 20 caracteres</span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <PrimaryButton
              onClick={handleSubmit}
              disabled={comment.length < 20 || rating === 0}
              className="flex-1"
            >
              Publicar opinión
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setRating(0);
                setComment('');
              }}
            >
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      )}

      {/* Other Opinions */}
      <div className="space-y-4">
        {displayedOpinions.length === 0 && !currentUserOpinion ? (
          <div className="text-center py-8 text-[#64748B]">
            Sé el primero en dejar tu opinión
          </div>
        ) : (
          displayedOpinions.map((opinion: Rating) => (
            <div key={opinion.id} className="bg-white rounded-xl border border-[#E2E8F0] p-4">
              <div className="flex items-start gap-4">
                {opinion.userAvatar ? (
                  <ImageWithFallback
                    src={opinion.userAvatar}
                    alt={opinion.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#334155]">
                    {opinion.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-[#334155] mb-1">{opinion.userName}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className={star <= opinion.rating ? 'fill-[#F97316] text-[#F97316]' : 'text-[#E2E8F0]'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#64748B]">{getRelativeTime(opinion.date)}</span>
                  </div>
                  <p className="text-[#64748B]">{opinion.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm text-[#64748B]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-[#F1F5F9] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tab 4: Reservas
function ReservasTab({ tables, isLoggedIn, onLoginClick }: any) {
  const router = useRouter();
  const [reservationStep, setReservationStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMesa, setSelectedMesa] = useState<any>(null);
  const [partySize, setPartySize] = useState(2);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationNumber] = useState(`RY${Date.now()}`);
  const [availableMesas, setAvailableMesas] = useState<any[]>([]);

  // Mock function to check mesa availability
  const checkMesaAvailability = (date: string, time: string) => {
    // Simulate API call: GET /api/establecimientos/{id}/reservas?fecha={date}&hora={time}
    const bookedMesas = ['t4']; // Mock booked mesas
    return tables.map((mesa: any) => ({
      ...mesa,
      status: bookedMesas.includes(mesa.id) ? 'reservada' : 'disponible'
    }));
  };

  // Check availability when date and time are selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      const available = checkMesaAvailability(selectedDate, selectedTime);
      setAvailableMesas(available);
    }
  }, [selectedDate, selectedTime]);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CL', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleNext = () => {
    setError(null);
    setReservationStep(reservationStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setReservationStep(reservationStep - 1);
  };

  const handleCancel = () => {
    setReservationStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedMesa(null);
    setPartySize(2);
    setNotes('');
    setError(null);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call: POST /api/reservas
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success - go to step 6
      setReservationStep(6);
    } catch (err) {
      setError('Error al confirmar la reserva. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-[#F1F5F9] rounded-xl p-6 text-center">
        <p className="text-[#64748B] mb-4">Inicia sesión para hacer una reserva</p>
        <PrimaryButton onClick={onLoginClick}>Iniciar sesión</PrimaryButton>
      </div>
    );
  }

  // STEP 1: SELECT DATE & TIME
  if (reservationStep === 1) {
    const isStep1Valid = selectedDate && selectedTime;
    
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">¿Cuándo quieres reservar?</h2>
            <span className="text-sm text-[#64748B]">Paso 1 de 6</span>
          </div>
          <p className="text-[#64748B]">Selecciona fecha y hora</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={getTodayDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-3 pl-12 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 text-[#334155] bg-white cursor-pointer hover:border-[#F97316]/50 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full"
                />
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F97316] pointer-events-none" size={20} />
              </div>
            </div>

            {/* Time Picker */}
            <div>
              <label className="block text-sm text-[#334155] mb-2">Hora</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
              >
                <option value="">Selecciona una hora</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            disabled={!isStep1Valid}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 2: SELECT AVAILABLE MESAS
  if (reservationStep === 2) {
    const isStep2Valid = selectedMesa !== null;
    
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">¿Qué mesa prefieres?</h2>
            <span className="text-sm text-[#64748B]">Paso 2 de 6</span>
          </div>
          <p className="text-[#64748B]">
            {formatDateDisplay(selectedDate)} a las {selectedTime}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMesas.map((mesa) => {
              const isAvailable = mesa.status === 'disponible';
              const isSelected = selectedMesa?.id === mesa.id;
              
              return (
                <button
                  key={mesa.id}
                  onClick={() => isAvailable && setSelectedMesa(mesa)}
                  disabled={!isAvailable}
                  className={`
                    p-4 rounded-xl border-3 text-left transition-all
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}
                    ${isSelected ? 'border-[#F97316] bg-[#F97316]/5' : 'border-[#E2E8F0]'}
                  `}
                  style={{ borderWidth: isSelected ? '3px' : '1px' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#334155]">{mesa.name}</h4>
                    <span 
                      className={`text-xs px-2 py-1 rounded ${
                        isAvailable 
                          ? 'bg-[#22C55E]/10 text-[#22C55E]' 
                          : 'bg-[#94A3B8]/10 text-[#94A3B8]'
                      }`}
                    >
                      {isAvailable ? 'Disponible' : 'Reservada'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#64748B]">
                    <Users size={16} />
                    <span>Capacidad: {mesa.capacity} personas</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
          >
            ← Volver
          </button>
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            disabled={!isStep2Valid}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 3: SELECT PARTY SIZE
  if (reservationStep === 3) {
    const isStep3Valid = partySize >= 1 && partySize <= selectedMesa.capacity;
    
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">¿Cuántas personas?</h2>
            <span className="text-sm text-[#64748B]">Paso 3 de 6</span>
          </div>
          <p className="text-[#64748B]">
            Capacidad de {selectedMesa.name}: {selectedMesa.capacity} personas
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setPartySize(Math.max(1, partySize - 1))}
              className="w-12 h-12 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors flex items-center justify-center text-2xl"
              disabled={partySize <= 1}
            >
              −
            </button>
            <div className="text-center">
              <div className="text-4xl mb-1">{partySize}</div>
              <div className="text-sm text-[#64748B]">personas</div>
            </div>
            <button
              onClick={() => setPartySize(Math.min(selectedMesa.capacity, partySize + 1))}
              className="w-12 h-12 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] transition-colors flex items-center justify-center text-2xl"
              disabled={partySize >= selectedMesa.capacity}
            >
              +
            </button>
          </div>
          {partySize > selectedMesa.capacity && (
            <p className="text-sm text-[#EF4444] text-center mt-4">
              Máximo {selectedMesa.capacity} personas (capacidad de la mesa)
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
          >
            ← Volver
          </button>
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            disabled={!isStep3Valid}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 4: NOTES / SPECIAL REQUESTS
  if (reservationStep === 4) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">Notas y solicitudes especiales</h2>
            <span className="text-sm text-[#64748B]">Paso 4 de 6</span>
          </div>
          <p className="text-[#64748B]">(Opcional)</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            placeholder="Ej: Cumpleaños, sin gluten, mesa cerca de la ventana, etc."
            className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl resize-none focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20"
            rows={5}
          />
          <div className="flex justify-end mt-2">
            <span className="text-sm text-[#64748B]">{notes.length}/200</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleBack}
            className="text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
          >
            ← Volver
          </button>
          <button
            onClick={handleCancel}
            className="text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Cancelar
          </button>
          <div className="flex-1" />
          <PrimaryButton
            onClick={handleNext}
            className="px-8"
          >
            Siguiente
          </PrimaryButton>
        </div>
      </div>
    );
  }

  // STEP 5: REVIEW & CONFIRM
  if (reservationStep === 5) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[#334155]">Revisa tu reserva</h2>
            <span className="text-sm text-[#64748B]">Paso 5 de 6</span>
          </div>
          <p className="text-[#64748B]">Verifica que todo esté correcto antes de confirmar</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Establecimiento</span>
              <div className="text-right">
                <div className="text-[#334155]">{MOCK_ESTABLISHMENT.name}</div>
                <TypeBadge type={MOCK_ESTABLISHMENT.type} />
              </div>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Fecha</span>
              <span className="text-[#334155]">{formatDateDisplay(selectedDate)}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Hora</span>
              <span className="text-[#334155]">{selectedTime}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Mesa</span>
              <span className="text-[#334155]">{selectedMesa.name} (Capacidad: {selectedMesa.capacity})</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Número de personas</span>
              <span className="text-[#334155]">{partySize} {partySize === 1 ? 'persona' : 'personas'}</span>
            </div>

            <div className="flex justify-between py-3">
              <span className="text-[#64748B]">Notas especiales</span>
              <span className="text-[#334155] text-right max-w-xs">
                {notes || 'Sin notas especiales'}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444] rounded-xl p-4">
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <PrimaryButton
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full h-12"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Confirmando...
              </span>
            ) : (
              'Confirmar reserva'
            )}
          </PrimaryButton>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleBack}
              disabled={isLoading}
              className="text-[#64748B] hover:text-[#334155] transition-colors disabled:opacity-50"
            >
              Editar
            </button>
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="text-[#64748B] hover:text-[#334155] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>

          <p className="text-sm text-[#64748B] text-center">
            Política de cancelación: puedes cancelar hasta 24 horas antes
          </p>
        </div>
      </div>
    );
  }

  // STEP 6: SUCCESS CONFIRMATION
  if (reservationStep === 6) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#22C55E]/10 rounded-full flex items-center justify-center">
            <Check size={40} className="text-[#22C55E]" />
          </div>
          <h2 className="text-[#334155] mb-2">¡Tu reserva está confirmada!</h2>
          <p className="text-[#64748B]">Hemos enviado los detalles a tu correo</p>
        </div>

        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Establecimiento</span>
              <span className="text-[#334155]">{MOCK_ESTABLISHMENT.name}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Fecha</span>
              <span className="text-[#334155]">{formatDateDisplay(selectedDate)}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Hora</span>
              <span className="text-[#334155]">{selectedTime}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Mesa</span>
              <span className="text-[#334155]">{selectedMesa.name}</span>
            </div>

            <div className="flex justify-between py-3 border-b border-[#E2E8F0]">
              <span className="text-[#64748B]">Personas</span>
              <span className="text-[#334155]">{partySize}</span>
            </div>

            <div className="pt-3">
              <label className="block text-sm text-[#64748B] mb-2">
                Código de confirmación
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={confirmationNumber}
                  readOnly
                  className="flex-1 px-4 py-2 bg-[#F1F5F9] rounded-lg border border-[#E2E8F0] text-[#334155]"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(confirmationNumber)}
                  className="px-4 py-2 text-sm text-[#F97316] hover:text-[#EA580C] transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <SecondaryButton
            onClick={() => router.push('/profile')}
            className="flex-1"
          >
            Ver mis reservas
          </SecondaryButton>
          <PrimaryButton
            onClick={() => router.push('/')}
            className="flex-1"
          >
            Ir a inicio
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return null;
}

// Main Component
export default function EstablishmentDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState('informacion');
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentUserOpinion] = useState(null); // Mock: null means user hasn't reviewed yet

  const tabs: TabItem[] = [
    { id: '1', label: 'Información', value: 'informacion' },
    { id: '2', label: 'Menú', value: 'menu' },
    { id: '3', label: 'Opiniones', value: 'opiniones' },
    { id: '4', label: 'Reservas', value: 'reservas' },
  ];

  const handleBack = () => {
    router.back();
  };

  const handleReserveClick = () => {
    setActiveTab('reservas');
  };

  const handleSubmitOpinion = (opinion: any) => {
    console.log('Submit opinion:', opinion);
    // In real app: API call to POST /api/opiniones
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <EstablishmentHeader
        establishment={MOCK_ESTABLISHMENT}
        onBack={handleBack}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
      />

      <QuickInfoBar
        establishment={MOCK_ESTABLISHMENT}
        onReserveClick={handleReserveClick}
        isLoggedIn={isLoggedIn}
      />

      <div className="sticky top-[120px] z-30 bg-white border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl p-6">
          {activeTab === 'informacion' && (
            <InformacionTab
              establishment={MOCK_ESTABLISHMENT}
              hours={MOCK_HOURS}
              photos={MOCK_PHOTOS}
            />
          )}
          {activeTab === 'menu' && (
            <MenuTab menuItems={MOCK_MENU_ITEMS} />
          )}
          {activeTab === 'opiniones' && (
            <OpinionesTab
              opinions={MOCK_OPINIONS}
              currentUserOpinion={currentUserOpinion}
              isLoggedIn={isLoggedIn}
              onSubmitOpinion={handleSubmitOpinion}
              onLoginClick={handleLoginClick}
            />
          )}
          {activeTab === 'reservas' && (
            <ReservasTab
              tables={MOCK_TABLES}
              isLoggedIn={isLoggedIn}
              onLoginClick={handleLoginClick}
            />
          )}
        </div>
      </div>
    </div>
  );
}