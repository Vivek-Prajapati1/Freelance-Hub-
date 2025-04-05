import axios from "axios";

//backend port number
const newRequest = axios.create({
    baseURL: "http://localhost:8000/api/",
    withCredentials: true,
});

// Add a request interceptor to handle FormData
newRequest.interceptors.request.use(
    (config) => {
        // If the request data is FormData, remove the Content-Type header
        // to let the browser set it automatically with the boundary
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle authentication errors
newRequest.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Clear user data and redirect to login
            localStorage.removeItem("currentUser");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default newRequest;