// lib/api/patientReadingHistoryService.ts
import { apiClient } from "@/lib/api/apiClient";
import type { ApiResponse } from "@/lib/api/types";
import type { PatientReadingHistory } from "@/types/patientReadingHistory";

interface PatientReadingHistoryRequest {
  filter?: any;
  columns: string[];
  sqltypes?: Record<string, number>;
  offset?: number;
  pageSize?: number;
  orderBy?: Array<{ columnName: string; ascendent: boolean }>;
}

export const PatientReadingHistoryService = {
  getPatientReadingHistories: async (
    page: number = 1,
    pageSize: number = 10,
    sortColumn?: string,
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<{ data: PatientReadingHistory[]; total: number }> => {
    const payload: PatientReadingHistoryRequest = {
      columns: [
        "id",
        "patient_id",
        "reading_date",
        "breakfast",
        "lunch",
        "dinner",
        "bedtime",
        "notes_for_day",
      ],
      sqltypes: {
        id: 4,
        patient_id: 4,
        breakfast: 8,
        lunch: 8,
        dinner: 8,
        bedtime: 8,
        notes_for_day: 12,
      },
      offset: (page - 1) * pageSize,
      pageSize,
      orderBy: sortColumn
        ? [{ columnName: sortColumn, ascendent: sortDirection === "asc" }]
        : [{ columnName: "reading_date", ascendent: false }], // Default sort by most recent dates
      filter: {},
    };

    const response = await apiClient
      .post<ApiResponse<PatientReadingHistory[]>>(
        "/ReadingHistory/ReadingHistory",
        payload
      )
      .catch((error) => {
        console.error("API Error Details:", {
          url: error.config?.url,
          payload,
          status: error.response?.status,
          response: error.response?.data,
        });
        throw error;
      });

    if (response.data.code !== 0) throw new Error("API Error");

    const processedData = response.data.data.map((item: any) => ({
      ...item,
      // Parse numeric values if needed (assuming API returns strings)
      breakfast: parseFloat(item.breakfast),
      lunch: parseFloat(item.lunch),
      dinner: parseFloat(item.dinner),
      bedtime: parseFloat(item.bedtime),
    }));

    const total =
      processedData.length >= pageSize
        ? page * pageSize + 1
        : (page - 1) * pageSize + processedData.length;

    return { data: processedData, total };
  },

  createReadingHistory: async (reading: Omit<PatientReadingHistory, "id">) => {
    const response = await apiClient.post<ApiResponse<PatientReadingHistory>>(
      "/ReadingHistory/ReadingHistory",
      reading
    );
    if (response.data.code !== 0) throw new Error("API Error");
    return response.data.data;
  },
};
