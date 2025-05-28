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
  
  insertPatient: async (patient: Patient): Promise<Patient> => {
    try {
      const formattedPatient = {
        ...patient,
        //hba1c: patient.hba1c ? Number(patient.hba1c).toFixed(2) : undefined,
        //creatine_mg_dl: patient.creatine_mg_dl
        //  ? Number(patient.creatine_mg_dl).toFixed(4)
        //  : undefined,
      };
      const payload = {
        data: formattedPatient,
        columns: PATIENT_COLUMNS,   
        sqltypes: {
          id: 4,
          name: 12,
          birth_date: 93,
          weight: 8,
          height: 8,
          hba1c: 8,
          duration: 8,
        } 
      };
      const response = await apiClient.post<ApiResponse<Patient>>(
        "/Patient/Patient",
        payload
      );
      // Debugging log    
      console.log("Insert Patient response:", response.data);
      if (response.data.code !== 0) {
        throw new Error(
          response.data.message || `API Error Code ${response.data.code}`
        );
      }return {
        ...response.data.data,
        age: Number(response.data.data.age).toFixed(1),
        hba1c: Number(response.data.data.hba1c).toFixed(1),
        creatine_mg_dl: Number(response.data.data.creatine_mg_dl).toFixed(4),
      };
    } catch (error: any) {
      // Enhanced error parsing
      const errorMessage =
        error.response?.data?.msg || error.message || "Unknown update error";
      console.error("Insert failed:", {
        error: errorMessage,
        status: error.response?.status,
      });
      throw new Error(errorMessage);
    }
  },
  updatePatient: async (
    id: number,
    updates: Partial<Patient>
  ): Promise<Patient> => {
    try {
      const formattedUpdates = {
        ...updates,
        age: updates.age ? Number(updates.age).toFixed(1) : undefined,
        hba1c: updates.hba1c ? Number(updates.hba1c).toFixed(2) : undefined,
        creatine_mg_dl: updates.creatine_mg_dl
          ? Number(updates.creatine_mg_dl).toFixed(4)
          : undefined,
      };

      const payload = {
        data: formattedUpdates,
        filter: {'id':id.toString()},
        sqltypes: {'id': 4}
      };      

      const response = await apiClient.patch<ApiResponse<Patient>>(
        `/Patient/Patient`,
        payload
      );

      // Debugging log
      console.log("Update response:", response.data);

      if (response.data.code !== 0) {
        throw new Error(
          response.data.message || `API Error Code ${response.data.code}`
        );
      }

      return {
        ...response.data.data,
        age: Number(response.data.data.age).toFixed(1),
        hba1c: Number(response.data.data.hba1c).toFixed(1),
        creatine_mg_dl: Number(response.data.data.creatine_mg_dl).toFixed(4),
      };
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
