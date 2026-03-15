import axios from "axios";

const baseURL = 'https://sartaaj-bharat-backend.onrender.com/v1/api';
// const baseURL = 'http://localhost:6005/v1/api';
// const baseURL = "https://gkstore-backend.onrender.com/v1/api";
// const baseURL = "https://apijd.bytethard.com/v1/api";
// const baseURL= "https://api.gurmeetkaurstore.com/v1/api";
const Axios = axios.create({
  baseURL,
  withCredentials: true, // send cookies
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Skip refresh logic for these specific routes to avoid infinite loops
    const skipRefreshRoutes = [
      '/auth/refresh-token',
      '/auth/login',
      '/auth/logout'
    ];

    const shouldSkipRefresh = skipRefreshRoutes.some(route =>
      originalRequest.url?.includes(route)
    );

    if (err.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => Axios(originalRequest))
          .catch((refreshErr) => Promise.reject(refreshErr));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
            headers: localStorage.getItem('adminToken') 
              ? { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
              : {}
          }
        );
        
        // If the refresh token also gave us a new access token in the body, update it
        const newToken = refreshResponse.data?.token || refreshResponse.data?.data?.token || refreshResponse.data?.data?.accessToken;
        if (newToken) {
          localStorage.setItem('adminToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null);
        isRefreshing = false;

        return Axios(originalRequest); // Retry the original request
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        console.error("❌ Refresh token failed. Redirecting to login.");

        localStorage.removeItem("user");
        localStorage.removeItem("adminToken");
        sessionStorage.clear();
        
        // Only redirect if we are not already at the signin page
        if (window.location.pathname !== "/signin") {
          window.location.href = "/signin";
        }
        
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default Axios;
