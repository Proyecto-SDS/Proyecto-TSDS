'use client';

import { ArrowLeft, Calendar, Edit2, LogOut, Mail, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PrimaryButton } from '../../components/buttons/PrimaryButton';
import { SecondaryButton } from '../../components/buttons/SecondaryButton';
import { TextInput } from '../../components/inputs/TextInput';
import { Modal } from '../../components/modals/Modal';
import { Toast, useToast } from '../../components/notifications/Toast';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateProfile } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#64748B] mb-4">No has iniciado sesión</p>
          <PrimaryButton onClick={() => router.push('/login')}>Iniciar sesión</PrimaryButton>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    showToast('success', 'Sesión cerrada correctamente');
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  };

  const handleBack = () => {
    router.push('/');
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    const result = await updateProfile(editForm.nombre, editForm.telefono);
    setIsLoading(false);

    if (result.success) {
      showToast('success', 'Perfil actualizado correctamente');
      setIsEditModalOpen(false);
    } else {
      showToast('error', result.error || 'Error al actualizar perfil');
    }
  };

  // Mock user reservations
  const mockReservations = [
    {
      id: '1',
      establishmentName: 'La Buena Mesa',
      date: '2024-11-30',
      time: '20:00',
      mesa: 'Mesa 2',
      guests: 4,
      status: 'confirmada',
    },
    {
      id: '2',
      establishmentName: 'El Restobar Moderno',
      date: '2024-12-05',
      time: '19:30',
      mesa: 'Mesa Terraza',
      guests: 2,
      status: 'confirmada',
    },
  ];

  // Mock user opinions
  const mockOpinions = [
    {
      id: '1',
      establishmentName: 'La Buena Mesa',
      rating: 5,
      comment: 'Excelente experiencia! La pasta carbonara estaba deliciosa.',
      date: '2024-11-20T19:30:00',
    },
    {
      id: '2',
      establishmentName: 'Bar Central',
      rating: 4,
      comment: 'Muy buen ambiente y atención.',
      date: '2024-11-15T21:00:00',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft size={24} className="text-[#334155]" />
          </button>
          <h1 className="text-[#334155]">Mi perfil</h1>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-linear-to-r from-[#F97316] to-[#EF4444] flex items-center justify-center text-white text-3xl shrink-0">
              {user.nombre.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-[#334155] mb-2">{user.nombre}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#64748B] justify-center sm:justify-start">
                  <Mail size={16} />
                  <span className="text-sm">{user.correo}</span>
                </div>
                {user.telefono && (
                  <div className="flex items-center gap-2 text-[#64748B] justify-center sm:justify-start">
                    <Phone size={16} />
                    <span className="text-sm">{user.telefono}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#64748B] justify-center sm:justify-start">
                  <Calendar size={16} />
                  <span className="text-sm">
                    Miembro desde {formatDate(user.creado_el, 'long')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <PrimaryButton
                size="md"
                onClick={() => setIsEditModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Edit2 size={18} />
                Editar perfil
              </PrimaryButton>
              <SecondaryButton
                size="md"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                <LogOut size={18} />
                Cerrar sesión
              </SecondaryButton>
            </div>
          </div>
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-[#334155] mb-4">Mis reservas próximas</h3>
          {mockReservations.length > 0 ? (
            <div className="space-y-4">
              {mockReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border border-[#E2E8F0] rounded-xl p-4 hover:border-[#F97316] transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#334155]">{reservation.establishmentName}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-[#22C55E]/10 text-[#22C55E]">
                      {reservation.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[#64748B]">
                    <div>
                      <span className="">Fecha:</span> {formatDate(reservation.date, 'short')}
                    </div>
                    <div>
                      <span className="">Hora:</span> {reservation.time}
                    </div>
                    <div>
                      <span className="">Mesa:</span> {reservation.mesa}
                    </div>
                    <div>
                      <span className="">Personas:</span> {reservation.guests}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B] text-center py-8">
              No tienes reservas próximas
            </p>
          )}
        </div>

        {/* Recent Opinions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-[#334155] mb-4">Mis opiniones recientes</h3>
          {mockOpinions.length > 0 ? (
            <div className="space-y-4">
              {mockOpinions.map((opinion) => (
                <div
                  key={opinion.id}
                  className="border border-[#E2E8F0] rounded-xl p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-[#334155]">{opinion.establishmentName}</h4>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={star <= opinion.rating ? 'text-[#F97316]' : 'text-[#E2E8F0]'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-[#64748B] mb-2">{opinion.comment}</p>
                  <p className="text-xs text-[#94A3B8]">
                    {formatDate(opinion.date, 'long')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#64748B] text-center py-8">
              No has escrito opiniones aún
            </p>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar perfil"
        size="md"
      >
        <div className="space-y-4">
          <TextInput
            label="Nombre completo"
            value={editForm.nombre}
            onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
            placeholder="Tu nombre"
          />
          <TextInput
            label="Teléfono"
            value={editForm.telefono}
            onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
            placeholder="+56912345678"
          />
          <div className="bg-[#F1F5F9] rounded-lg p-3">
            <p className="text-sm text-[#64748B]">
              <strong>Correo:</strong> {user.correo}
            </p>
            <p className="text-xs text-[#94A3B8] mt-1">
              El correo no puede ser modificado por seguridad
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <PrimaryButton
              className="flex-1"
              onClick={handleUpdateProfile}
              isLoading={isLoading}
              disabled={isLoading}
            >
              Guardar cambios
            </PrimaryButton>
            <SecondaryButton
              className="flex-1"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancelar
            </SecondaryButton>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  );
}