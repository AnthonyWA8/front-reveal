import axios from 'axios';

const API_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// interceptor para agregar token y userId automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (userId) {
    config.headers['x-solicitante-id'] = userId;
  }
  return config;
});

// AUTH
export const authService = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

// USER
export const userService = {
  crearPerfil: (data: any) => api.post('/users', data),
  obtenerPerfil: (id: string) => api.get(`/users/${id}`),
  obtenerPerfilConNivel: (id: string, nivel: number) => api.get(`/users/${id}`, {
    headers: { 'x-nivel-privacidad': nivel.toString() }
  }),
  actualizarPerfil: (id: string, data: any) => api.put(`/users/${id}`, data),
  agregarIntereses: (id: string, intereses: any[]) => api.post(`/users/${id}/intereses`, { intereses }),
  actualizarFotos: (id: string, fotos: string[]) => api.put(`/users/${id}/fotos`, { fotos }),
};

// DOCUMENTO
export const documentoService = {
  verificarCarnet: (formData: FormData) => api.post('/documento/verificar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// MATCHES
export const matchService = {
  descubrir: (userId: string) => api.get(`/matches/descubrir/${userId}`),
  like: (emisorId: string, receptorId: string) => api.post('/matches/like', { emisorId, receptorId }),
  misMatches: (userId: string) => api.get(`/matches/mis-matches/${userId}`),
};

// STATS
export const statsService = {
  incrementar: (campo: 'matches' | 'conversaciones' | 'planes_exitosos') => {
    const userId = localStorage.getItem('userId');
    if (!userId) return Promise.resolve();
    return api.post(`/users/${userId}/stats`, { campo });
  },
  actualizarCompatibilidad: (valor: number) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return Promise.resolve();
    return api.post(`/users/${userId}/stats`, { campo: 'compatibilidad', valor });
  },
};

export default api;