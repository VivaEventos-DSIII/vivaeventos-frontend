import api from './config';
export const createOrder = (data) => api.post('/api/orders', data);
export const getEventSales = (eventId) => api.get(`/api/orders/events/${eventId}/sales`);
export const getEventStatistics = (eventId) => api.get(`/api/orders/events/${eventId}/statistics`);
