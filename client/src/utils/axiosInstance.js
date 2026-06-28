import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantDomain = window.location.hostname;
    if (tenantDomain) {
      config.headers["x-tenant-domain"] = tenantDomain;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
