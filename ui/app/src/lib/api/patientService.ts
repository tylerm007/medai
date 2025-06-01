// lib/api/patientService.ts
import { apiClient } from "@/lib/api/apiClient";
import type { ApiResponse } from "@/lib/api/types";
import type { Patient } from "@/types/patient";
import { baseAPIClient } from "@/lib/api/baseAPIClient";

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

  updatePatient: async (
    id: number,
    updates: Partial<Patient>
  ): Promise<Patient> => {
    try {
      const formattedUpdates = {
        ...updates,
        cad:
          typeof updates.cad === "string"
            ? updates.cad === "Yes"
              ? 1
              : 0
            : updates.cad,
        ckd:
          typeof updates.ckd === "string"
            ? updates.ckd === "Yes"
              ? 1
              : 0
            : updates.ckd,
        hld:
          typeof updates.hld === "string"
            ? updates.hld === "Yes"
              ? 1
              : 0
            : updates.hld,
        age: updates.age ? Number(updates.age).toFixed(1) : undefined,
        hba1c: updates.hba1c ? Number(updates.hba1c).toFixed(2) : undefined,
        creatine_mg_dl: updates.creatine_mg_dl
          ? Number(updates.creatine_mg_dl).toFixed(4)
          : undefined,
      };

      const payload = {
        data: {
          attributes: formattedUpdates,
          type: "Patient",
          id: id.toString(),
        },
      };

      const response = await baseAPIClient.patch<ApiResponse<Patient>>(
        `http://ec2-54-145-40-116.compute-1.amazonaws.com:5656/api/Patient/${id}`,
        payload
      );

      // Debugging log
      console.log("Update response:", response.data);

      return response.data.data;
    } catch (error: any) {
      // Enhanced error parsing
      const errorMessage =
        error.response?.data?.msg || error.message || "Unknown update error";
      console.error("Update failed:", {
        error: errorMessage,
        payload: updates,
        status: error.response?.status,
      });
      throw new Error(errorMessage);
    }
  },
};
