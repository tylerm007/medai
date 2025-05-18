// lib/api/patientService.ts
import { apiClient } from "@/lib/api/apiClient";
import type { ApiResponse } from "@/lib/api/types";
import type { Patient } from "@/types/patient";

const PATIENT_COLUMNS: (keyof Patient)[] = [
  "id",
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
  "ckd",
  "cad",
  "hld",
];

export const PatientService = {
  getAllPatients: async (search?: string): Promise<Patient[]> => {
    const response = await apiClient.post<ApiResponse<Patient[]>>(
      "/Patient/Patient",
      {
        columns: PATIENT_COLUMNS,
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
        columns: PATIENT_COLUMNS,
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
