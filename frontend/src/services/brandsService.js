import api from './api';

export const brandsAPI = {
    getAll: () => api.get('/brands'),
    getById: (id) => api.get(`/brands/${id}`),
    create: (brandData) => api.post('/brands', brandData),
    update: (id, brandData) => api.put(`/brands/${id}`, brandData),
    delete: (id) => api.delete(`/brands/${id}`),
};

export default brandsAPI;
