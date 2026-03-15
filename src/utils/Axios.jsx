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

Axios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // 👉 Skip refresh logic if the failing endpoint is /profile
    const isProfileRoute = originalRequest.url?.includes("/auth/profile");

    if (err.response?.status === 401 && !originalRequest._retry && !isProfileRoute) {
      originalRequest._retry = true;

      try {
        await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );

        return Axios(originalRequest); // Retry the original request
      } catch (refreshErr) {
        console.error("❌ Refresh token failed. Redirecting to login.");

        localStorage.removeItem("user");
        sessionStorage.clear();
        window.location.href = "/signin"; // Redirect to login
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);

export default Axios;
