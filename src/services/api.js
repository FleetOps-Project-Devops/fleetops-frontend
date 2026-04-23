import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 10000,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout on 401
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      // Dispatch an event so React context can pick it up
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const vehicleAPI = {
  getVehicles: (params) => api.get('/api/vehicles', { params }),
  getVehicle: (id) => api.get(`/api/vehicles/${id}`),
  createVehicle: (data) => api.post('/api/vehicles', data),
  updateVehicle: (id, data) => api.put(`/api/vehicles/${id}`, data),
  deleteVehicle: (id) => api.delete(`/api/vehicles/${id}`),
  updateStatus: (id, status) => api.patch(`/api/vehicles/${id}/status`, { status }),
  updateMileage: (id, mileage) => api.patch(`/api/vehicles/${id}/mileage`, { mileage }),
  getDashboard: () => api.get('/api/vehicles/dashboard'),
  getInsuranceAlerts: () => api.get('/api/vehicles/alerts/insurance'),
  getServiceAlerts: () => api.get('/api/vehicles/alerts/service')
};

export const taskAPI = {
  getQueue: () => api.get('/api/tasks'),
  addTask: (data) => api.post('/api/tasks/add', data),
  removeTask: (taskId) => api.delete(`/api/tasks/remove/${taskId}`),
  clearQueue: () => api.delete('/api/tasks/clear')
};

export const requestAPI = {
  createRequest: (data) => api.post('/api/requests', data),
  getRequests: () => api.get('/api/requests'),
  getRequest: (id) => api.get(`/api/requests/${id}`),
  getRequestsByVehicle: (vehicleId) => api.get(`/api/requests/vehicle/${vehicleId}`),
  updateStatus: (id, status) => api.patch(`/api/requests/${id}/status`, { status }),
  assignTechnician: (id, technician) => api.patch(`/api/requests/${id}/assign`, { technician }),
  completeRequest: (id, data) => api.patch(`/api/requests/${id}/complete`, data)
};

export default api;
