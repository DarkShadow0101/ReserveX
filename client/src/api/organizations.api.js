import apiClient from './client';

export const organizationsApi = {
  createOrganization: async (data) => {
    const res = await apiClient.post('/organizations', data);
    return res.data;
  },
  getMyOrganizations: async () => {
    const res = await apiClient.get('/organizations/me');
    return res.data;
  },
  getOrganizationById: async (id) => {
    const res = await apiClient.get(`/organizations/${id}`);
    return res.data;
  },
  getMembers: async (id) => {
    const res = await apiClient.get(`/organizations/${id}/members`);
    return res.data;
  },
  addMember: async (id, memberData) => {
    const res = await apiClient.post(`/organizations/${id}/members`, memberData);
    return res.data;
  },
  removeMember: async (id, userId) => {
    const res = await apiClient.delete(`/organizations/${id}/members/${userId}`);
    return res.data;
  },
  getOrganizationEvents: async (id, params) => {
    const res = await apiClient.get(`/organizations/${id}/events`, { params });
    return res.data;
  },
  createEvent: async (id, eventData) => {
    const res = await apiClient.post(`/organizations/${id}/events`, eventData);
    return res.data;
  }
};
