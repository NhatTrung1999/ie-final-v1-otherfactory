import axios from 'axios';

const axiosConfig = axios.create({
  baseURL: import.meta.env.VITE_URLS || 'http://localhost:6868/',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosConfig.interceptors.request.use(
  function (config) {
    const accessToken: { accessToken: string } = {
      accessToken: localStorage.getItem('accessToken') || '',
    };

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken.accessToken}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

axiosConfig.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);

export default axiosConfig;
