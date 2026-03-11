import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const authService = {
  login: async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem('revaDoToken', response.data.token);
    }
    return response.data;
  },

  signup: (userData) => {
    return axios.post(`${API_URL}/signup`, userData);
  },

  forgotPassword: (email) => {
    return axios.post(`${API_URL}/forgot-password`, { email });
  },

  resetPassword: (token, password) => {
    // Note: Matches your Spring Boot @RequestParam requirement
    return axios.post(`${API_URL}/reset-password`, null, {
      params: { token, password }
    });
  },

  logout: () => {
    localStorage.removeItem('revaDoToken');
    window.location.href = '/login';
  }
};