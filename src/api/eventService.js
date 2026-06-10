import api from './config';
export const getCatalog = () => api.get('/api/events/catalog');
export const filterEvents = (params) => api.get('/api/events', { params });
export const createEvent = (data) => api.post('/api/events', data);
export const updatePrice = (id, data) => api.patch(`/api/events/${id}/price`, data);
export const cancelEvent = (id, data) => api.delete(`/api/events/${id}`, { data });
