// API Client for ReservaYa
// Handles all API calls to Flask backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

interface ApiCallOptions extends RequestInit {
  token?: string;
}

export async function apiCall(endpoint: string, options: ApiCallOptions = {}) {
  const token = options.token || localStorage.getItem('auth_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
}

// Specific API methods
export const api = {
  // Auth endpoints
  login: (correo: string, contrasena: string) =>
    apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ correo, contrasena }),
    }),

  register: (nombre: string, correo: string, telefono: string, contrasena: string) =>
    apiCall('/api/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, correo, telefono, contrasena }),
    }),

  logout: () =>
    apiCall('/api/logout', {
      method: 'POST',
    }),

  // User endpoints
  getProfile: () => apiCall('/api/profile'),

  updateProfile: (nombre: string, telefono: string) =>
    apiCall('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({ nombre, telefono }),
    }),

  // Establishment endpoints
  getEstablishments: (params?: { comuna_id?: string; tipo_id?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiCall(`/api/establecimientos${query}`);
  },

  getEstablishmentById: (id: string) =>
    apiCall(`/api/establecimientos/${id}`),

  getEstablishmentHours: (id: string) =>
    apiCall(`/api/establecimientos/${id}/horario`),

  getEstablishmentPhotos: (id: string) =>
    apiCall(`/api/establecimientos/${id}/fotos`),

  getEstablishmentMenu: (id: string) =>
    apiCall(`/api/establecimientos/${id}/productos`),

  // Opinion endpoints
  getOpinions: (id: string, page: number = 1, limit: number = 10) =>
    apiCall(`/api/establecimientos/${id}/opiniones?page=${page}&limit=${limit}`),

  getUserOpinion: (id: string) =>
    apiCall(`/api/establecimientos/${id}/opiniones/user`),

  createOpinion: (id: string, puntuacion: number, comentario: string) =>
    apiCall('/api/opiniones', {
      method: 'POST',
      body: JSON.stringify({ id_local: id, puntuacion, comentario }),
    }),

  // Reservation endpoints
  getTables: (id: string) =>
    apiCall(`/api/establecimientos/${id}/mesas`),

  getReservations: (id: string, fecha: string) =>
    apiCall(`/api/establecimientos/${id}/reservas?fecha=${fecha}`),

  createReservation: (
    id_local: string,
    id_mesa: string,
    fecha_reserva: string,
    hora_reserva: string,
    numero_personas: number,
    notas?: string
  ) =>
    apiCall('/api/reservas', {
      method: 'POST',
      body: JSON.stringify({
        id_local,
        id_mesa,
        fecha_reserva,
        hora_reserva,
        numero_personas,
        notas,
      }),
    }),

  // Commune endpoints
  getCommunes: () => apiCall('/api/comunas'),
};
