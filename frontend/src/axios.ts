import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Use the environment variable
  timeout: 10000, // Optional: Set a timeout (in milliseconds)
  headers: {
    "Content-Type": "application/json", // Optional: Set default headers
  },
});