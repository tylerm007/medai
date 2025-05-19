// lib/api/apiClient.ts
import axios from "axios";

export const apiClient = axios.create({
  //baseURL: 'http://ec2-54-147-28-15.compute-1.amazonaws.com:5656/api'
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  try {
    const storedAuth = localStorage.getItem("medai-auth");
    const token = storedAuth ? JSON.parse(storedAuth).token : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("Token parsing failed", err);
  }

  return config;
});
