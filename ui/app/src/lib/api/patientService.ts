// lib/api/patientService.ts
import axios from "axios";
import { useAuth } from "@/context/AuthContext";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const storedAuth = localStorage.getItem("medai-auth");
  const token = storedAuth ? JSON.parse(storedAuth).token : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Patient {
  id: number;
  name: string;
  birth_date: string;
  age: string;
  weight: number;
  height: number;
  hba1c: string;
  duration: number;
  patient_sex: "M" | "F";
  creatine_mg_dl: string;
  medical_record_number: string;
  created_date: string;
  ckd: 0 | 1;
  cad: 0 | 1;
  hld: 0 | 1;
}

interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export const PatientService = {
  getAllPatients: async (search?: string): Promise<Patient[]> => {
    const response = await apiClient.post<ApiResponse<Patient[]>>(
      "/Patient/Patient",
      {
        columns: [
          "name",
          "birth_date",
          "age",
          "weight",
          "height",
          "hba1c",
          "duration",
          "patient_sex",
          "creatine_mg_dl",
          "medical_record_number",
          "created_date",
          "id",
          "ckd",
          "cad",
          "hld",
        ],
        filter: search
          ? {
              $or: [
                { name: { like: `%${search}%` } },
                { medical_record_number: { like: `%${search}%` } },
              ],
            }
          : undefined,
      }
    );

    if (response.data.code !== 0) throw new Error("API Error");
    return response.data.data;
  },

  getPatientById: async (id: number): Promise<Patient> => {
    const response = await apiClient.post<ApiResponse<Patient[]>>(
      "/Patient/Patient",
      {
        columns: [
          "name",
          "birth_date",
          "age",
          "weight",
          "height",
          "hba1c",
          "duration",
          "patient_sex",
          "creatine_mg_dl",
          "medical_record_number",
          "id",
          "ckd",
          "cad",
          "hld",
        ],
        filter: {
          id: id, // Simplified filter format
        },
        limit: 1, // Add limit to ensure single result
      }
    );

    if (!response.data.data?.[0]) throw new Error("Patient not found");
    return response.data.data[0];
  },
};
