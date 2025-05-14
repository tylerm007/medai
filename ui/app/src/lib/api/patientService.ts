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
    const response = await apiClient.get<ApiResponse<Patient[]>>(
      "/Patient",
    );

    if (response.status !== 200) throw new Error("API Error");
    return response.data.data;
  },

  getPatientById: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<ApiResponse<Patient[]>>(
      "/Patient/44" ,
    );

    if (!response.data.data?.[0]) throw new Error("Patient not found");
    return response.data.data[0];
  },
};
