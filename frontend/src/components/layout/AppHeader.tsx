'use client';

import { LogOut, MapPin, Menu, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SANTIAGO_COMMUNES } from '../../utils/constants';
import { SelectDropdown } from '../inputs/SelectDropdown';

export function AppHeader() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCommune, setSelectedCommune] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const communeOptions = SANTIAGO_COMMUNES.map((commune) => ({
    value: commune,
    label: commune,
  }));

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`
        sticky top-0 z-50
        bg-white
        transition-shadow duration-200
        ${isScrolled ? 'shadow-md' : ''}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-linear-to-r from-[#F97316] to-[#EF4444] rounded-lg flex items-center justify-center">
              <span className="text-white">R</span>
            </div>
            <span className="hidden sm:block text-[#334155]">ReservaYa</span>
          </Link>

          {/* Center - Location Filter (Desktop) */}
          {location.pathname === '/' && (
            <div className="hidden md:block flex-1 max-w-xs">
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none z-10"
                  size={18}
                />
                <SelectDropdown
                  options={communeOptions}
                  placeholder="¿Dónde?"
                  value={selectedCommune}
                  onChange={setSelectedCommune}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {/* Right - User Menu (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn && user ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
                    <span className="text-white text-sm">
                      {user.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-[#334155]">{user.nombre}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors text-[#334155]"
                >
                  <LogOut size={18} />
                  <span>Salir</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
              >
                <User size={18} />
                <span>Ingresar</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#F1F5F9] rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E2E8F0] space-y-4">
            {/* Location Filter */}
            {location.pathname === '/' && (
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none z-10"
                  size={18}
                />
                <SelectDropdown
                  options={communeOptions}
                  placeholder="¿Dónde?"
                  value={selectedCommune}
                  onChange={(value) => {
                    setSelectedCommune(value);
                    setIsMobileMenuOpen(false);
                  }}
                  className="pl-10"
                />
              </div>
            )}

            {/* User Menu */}
            {isLoggedIn && user ? (
              <>
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F97316] flex items-center justify-center">
                    <span className="text-white text-sm">
                      {user.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-[#334155]">{user.nombre}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
                >
                  <LogOut size={18} />
                  <span>Cerrar sesión</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleLoginClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
              >
                <User size={18} />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}