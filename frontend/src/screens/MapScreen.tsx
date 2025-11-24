'use client';

import { MapPin, Menu, Search, Star, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StatusBadge } from '../components/badges/StatusBadge';
import { TypeBadge } from '../components/badges/TypeBadge';
import { FilterChip } from '../components/inputs/FilterChip';
import type { Establishment, EstablishmentType } from '../types';
import { ESTABLISHMENT_TYPES } from '../utils/constants';

// Configurar token de Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Map center: Santiago, Chile
const SANTIAGO_CENTER: [number, number] = [-70.6693, -33.4489]; // [lng, lat]
const DEFAULT_ZOOM = 12;

// Mock data with real Santiago coordinates
const MOCK_ESTABLISHMENTS: Establishment[] = [
  {
    id: '1',
    name: 'La Buena Mesa',
    type: 'Restaurante',
    address: 'Av. Providencia 1234',
    commune: 'Providencia',
    phone: '+56912345678',
    email: 'contacto@labuena.cl',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    rating: 4.7,
    reviewCount: 128,
    status: 'open',
    closingTime: '23:00',
  },
  {
    id: '2',
    name: 'El Restobar Moderno',
    type: 'Restobar',
    address: 'Av. Las Condes 5678',
    commune: 'Las Condes',
    phone: '+56987654321',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
    rating: 4.3,
    reviewCount: 89,
    status: 'open',
    closingTime: '22:00',
  },
  {
    id: '3',
    name: 'Bar Central',
    type: 'Bar',
    address: 'Calle Monjitas 890',
    commune: 'Santiago Centro',
    phone: '+56911223344',
    image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
    rating: 4.5,
    reviewCount: 245,
    status: 'closed',
  },
  {
    id: '4',
    name: 'Restaurante Italiano',
    type: 'Restaurante',
    address: 'Av. Vitacura 3456',
    commune: 'Vitacura',
    phone: '+56922334455',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
    rating: 4.8,
    reviewCount: 312,
    status: 'open',
    closingTime: '23:30',
  },
  {
    id: '5',
    name: 'Restobar Ñuñoa',
    type: 'Restobar',
    address: 'Av. Irarrazaval 2345',
    commune: 'Ñuñoa',
    phone: '+56933445566',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
    rating: 4.2,
    reviewCount: 156,
    status: 'open',
    closingTime: '22:30',
  },
  {
    id: '6',
    name: 'Bar de Copas',
    type: 'Bar',
    address: 'Av. Providencia 2567',
    commune: 'Providencia',
    phone: '+56944556677',
    image: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
    rating: 4.6,
    reviewCount: 198,
    status: 'open',
    closingTime: '02:00',
  },
  {
    id: '7',
    name: 'Restaurante Maipú',
    type: 'Restaurante',
    address: 'Av. Pajaritos 4567',
    commune: 'Maipú',
    phone: '+56955667788',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    rating: 4.1,
    reviewCount: 87,
    status: 'open',
    closingTime: '22:00',
  },
  {
    id: '8',
    name: 'Bar Recoleta',
    type: 'Bar',
    address: 'Av. Recoleta 1234',
    commune: 'Recoleta',
    phone: '+56966778899',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    rating: 3.9,
    reviewCount: 64,
    status: 'closed',
  },
];

// Approximate coordinates for Santiago communes
const COMMUNE_COORDINATES: Record<string, [number, number]> = {
  'Santiago Centro': [-70.6506, -33.4372],
  'Providencia': [-70.6100, -33.4264],
  'Las Condes': [-70.5833, -33.4167],
  'Vitacura': [-70.5667, -33.3833],
  'Ñuñoa': [-70.5978, -33.4564],
  'Maipú': [-70.7667, -33.5167],
  'Recoleta': [-70.6333, -33.4167],
  'La Reina': [-70.5333, -33.4500],
  'Peñalolén': [-70.5333, -33.4833],
};

// Assign coordinates to establishments
const ESTABLISHMENTS_WITH_COORDS = MOCK_ESTABLISHMENTS.map((est) => ({
  ...est,
  coordinates: COMMUNE_COORDINATES[est.commune] || SANTIAGO_CENTER,
}));

// Simple map component using Mapbox GL JS
function SimpleMap({
  establishments,
  onMarkerClick,
  selectedCommune,
  selectedEstablishmentId,
  onBoundsChange,
}: {
  establishments: typeof ESTABLISHMENTS_WITH_COORDS;
  onMarkerClick: (est: typeof ESTABLISHMENTS_WITH_COORDS[0]) => void;
  selectedCommune: string;
  selectedEstablishmentId: string | null;
  onBoundsChange: (visible: typeof ESTABLISHMENTS_WITH_COORDS) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: SANTIAGO_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Update visible establishments when map moves
    map.current.on('moveend', () => {
      updateVisibleEstablishments();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update visible establishments based on viewport
  const updateVisibleEstablishments = () => {
    if (!map.current) return;

    const bounds = map.current.getBounds();
    if (!bounds) return;
    
    const visible = establishments.filter((est) => {
      const [lng, lat] = est.coordinates;
      return bounds.contains([lng, lat]);
    });

    onBoundsChange(visible);
  };

  // Update markers when establishments change
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    establishments.forEach((est) => {
      const colors = {
        Restaurante: '#F97316',
        Restobar: '#EA580C',
        Bar: '#FB923C',
      };

      const color = colors[est.type];
      const opacity = est.status === 'open' ? 1 : 0.5;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '50px';
      el.style.cursor = 'pointer';
      el.style.opacity = opacity.toString();
      
      el.innerHTML = `
        <svg width="40" height="50" viewBox="0 0 40 50" fill="none" style="filter: ${selectedEstablishmentId === est.id ? `drop-shadow(0 0 12px ${color}99)` : 'none'}; transition: all 0.2s;">
          <path
            d="M20 0C9.52 0 0 8.84 0 20.9C0 31.54 12.4 45.34 17.28 50.66C18.78 52.28 21.22 52.28 22.72 50.66C27.6 45.34 40 31.54 40 20.9C40 8.84 30.48 0 20 0Z"
            fill="${color}"
          />
          <circle cx="20" cy="20" r="8" fill="white" />
        </svg>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)';
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(est.coordinates)
        .addTo(map.current!);

      // Add click handler
      el.addEventListener('click', () => {
        onMarkerClick(est);
      });

      markersRef.current.set(est.id, marker);
    });

    updateVisibleEstablishments();
  }, [establishments, selectedEstablishmentId]);

  // Fly to commune when selected
  useEffect(() => {
    if (!map.current) return;

    if (selectedCommune && COMMUNE_COORDINATES[selectedCommune]) {
      map.current.flyTo({
        center: COMMUNE_COORDINATES[selectedCommune],
        zoom: 13,
        duration: 1500,
      });
    } else if (establishments.length > 0) {
      map.current.flyTo({
        center: SANTIAGO_CENTER,
        zoom: DEFAULT_ZOOM,
        duration: 1500,
      });
    }
  }, [selectedCommune, establishments.length]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-full"
      style={{ position: 'relative' }}
    />
  );
}

// Sidebar component
interface SidebarProps {
  establishments: typeof ESTABLISHMENTS_WITH_COORDS;
  totalCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedId: string | null;
  onSelectEstablishment: (id: string) => void;
}

function Sidebar({
  establishments,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelectEstablishment,
}: SidebarProps) {
  const router = useRouter();

  return (
    <div className="w-[280px] lg:w-[320px] h-full bg-white shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#E2E8F0] shrink-0">
        <h3 className="text-[#334155] mb-1">Establecimientos en vista</h3>
        <p className="text-sm text-[#64748B]">
          {establishments.length} de {totalCount} establecimientos
        </p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-[#E2E8F0] shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
          <input
            type="text"
            placeholder="Buscar en vista..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#334155]"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {establishments.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin size={48} className="text-[#CBD5E1] mx-auto mb-3" />
            <p className="text-[#64748B]">
              {searchQuery ? 'No se encontraron resultados' : 'No hay establecimientos en esta vista'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {establishments.slice(0, 50).map((est) => (
              <div
                key={est.id}
                onClick={() => onSelectEstablishment(est.id)}
                className={`
                  p-3 border rounded-xl cursor-pointer transition-all
                  hover:shadow-md hover:-translate-y-0.5
                  ${
                    selectedId === est.id
                      ? 'border-[#F97316] bg-[#F97316]/5'
                      : 'border-[#E2E8F0] hover:border-[#F97316]'
                  }
                `}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm text-[#334155] line-clamp-1 flex-1">
                    {est.name}
                  </h4>
                  <StatusBadge status={est.status} closingTime={est.closingTime} />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <TypeBadge type={est.type} />
                  {est.rating && (
                    <div className="flex items-center gap-1 text-xs text-[#64748B]">
                      <Star size={12} className="fill-[#F97316] text-[#F97316]" />
                      <span>{est.rating}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#64748B]">{est.commune}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/establecimiento/${est.id}`);
                  }}
                  className="mt-2 w-full text-xs text-[#F97316] hover:text-[#EA580C] transition-colors"
                >
                  Ver perfil →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Mobile Drawer component
interface MobileDrawerProps extends SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function MobileDrawer({
  establishments,
  totalCount,
  searchQuery,
  onSearchChange,
  selectedId,
  onSelectEstablishment,
  isOpen,
  onClose,
}: MobileDrawerProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-1000"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-1001 max-h-[70vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="w-12 h-1 bg-[#CBD5E1] rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-[#E2E8F0]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[#334155]">Establecimientos</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-[#64748B]">
            {establishments.length} de {totalCount} en vista
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-[#E2E8F0]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 focus:border-[#F97316]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {establishments.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin size={48} className="text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[#64748B]">
                {searchQuery ? 'No se encontraron resultados' : 'No hay establecimientos en esta vista'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {establishments.slice(0, 50).map((est) => (
                <div
                  key={est.id}
                  onClick={() => {
                    onSelectEstablishment(est.id);
                    onClose();
                  }}
                  className={`
                    p-3 border rounded-xl cursor-pointer transition-all
                    ${
                      selectedId === est.id
                        ? 'border-[#F97316] bg-[#F97316]/5'
                        : 'border-[#E2E8F0]'
                    }
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm text-[#334155] line-clamp-1 flex-1">
                      {est.name}
                    </h4>
                    <StatusBadge status={est.status} closingTime={est.closingTime} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <TypeBadge type={est.type} />
                    {est.rating && (
                      <div className="flex items-center gap-1 text-xs text-[#64748B]">
                        <Star size={12} className="fill-[#F97316] text-[#F97316]" />
                        <span>{est.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-[#64748B]">{est.commune}</p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/establecimiento/${est.id}`);
                    }}
                    className="mt-2 w-full text-xs text-[#F97316] hover:text-[#EA580C]"
                  >
                    Ver perfil →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function MapScreen() {
  const router = useRouter();
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedType, setSelectedType] = useState<EstablishmentType | 'Todos'>('Todos');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [visibleEstablishments, setVisibleEstablishments] = useState<typeof ESTABLISHMENTS_WITH_COORDS>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter establishments based on selected filters
  const filteredEstablishments = useMemo(() => {
    let filtered = ESTABLISHMENTS_WITH_COORDS;

    if (selectedCommune && selectedCommune !== '') {
      filtered = filtered.filter((est) => est.commune === selectedCommune);
    }

    if (selectedType !== 'Todos') {
      filtered = filtered.filter((est) => est.type === selectedType);
    }

    return filtered;
  }, [selectedCommune, selectedType]);

  // Filter visible establishments by search
  const searchedEstablishments = useMemo(() => {
    if (!debouncedSearch) return visibleEstablishments;

    return visibleEstablishments.filter((est) =>
      est.name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [visibleEstablishments, debouncedSearch]);

  const handleTypeFilter = (type: EstablishmentType | 'Todos') => {
    setSelectedType(type);
  };

  const handleMarkerClick = (establishment: typeof ESTABLISHMENTS_WITH_COORDS[0]) => {
    setSelectedEstablishmentId(establishment.id);
  };

  const handleSelectEstablishment = (id: string) => {
    setSelectedEstablishmentId(id);
  };

  // Mock loading state on initial render
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Filter Chips */}
      <div className="sticky top-0 z-999 bg-white border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <FilterChip
              label="Todos"
              active={selectedType === 'Todos'}
              onClick={() => handleTypeFilter('Todos')}
            />
            {ESTABLISHMENT_TYPES.map((type) => (
              <FilterChip
                key={type}
                label={type}
                active={selectedType === type}
                onClick={() => handleTypeFilter(type)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Map */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop/Tablet only) */}
        <div className="hidden md:block">
          <Sidebar
            establishments={searchedEstablishments}
            totalCount={filteredEstablishments.length}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedId={selectedEstablishmentId}
            onSelectEstablishment={handleSelectEstablishment}
          />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F1F5F9] z-1000">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#F97316] border-t-transparent mb-4"></div>
                <p className="text-[#64748B]">Cargando establecimientos...</p>
              </div>
            </div>
          ) : null}

          <SimpleMap
            establishments={filteredEstablishments}
            onMarkerClick={handleMarkerClick}
            selectedCommune={selectedCommune}
            selectedEstablishmentId={selectedEstablishmentId}
            onBoundsChange={setVisibleEstablishments}
          />

          {/* Mobile: List button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="md:hidden fixed bottom-6 left-6 z-999 bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-2 hover:shadow-xl transition-shadow"
          >
            <Menu size={20} className="text-[#334155]" />
            <span className="text-sm text-[#334155]">
              Listado ({visibleEstablishments.length})
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        establishments={searchedEstablishments}
        totalCount={filteredEstablishments.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedId={selectedEstablishmentId}
        onSelectEstablishment={handleSelectEstablishment}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Custom CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}