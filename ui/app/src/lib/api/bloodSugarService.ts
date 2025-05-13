// lib/api/bloodSugarService.ts
import { apiClient } from "@/lib/api/apiClient";
import type { ApiResponse } from "@/lib/api/types";
import type { BloodSugarReading } from "@/types/bloodSugar";

interface BloodSugarRequest {
  filter?: any;
  columns: string[];
  sqltypes?: Record<string, number>;
  offset?: number;
  pageSize?: number;
  orderBy?: Array<{ columnName: string; ascendent: boolean }>;
}

export const BloodSugarService = {
  getBloodSugarReadings: async (
    page: number = 1,
    pageSize: number = 10,
    sortColumn?: string,
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<{ data: BloodSugarReading[]; total: number }> => {
    const payload: BloodSugarRequest = {
      columns: [
        "id",
        "patient_id",
        "time_of_reading",
        "reading_value",
        "reading_date",
        "notes",
      ],
      sqltypes: {
        id: 4,
        reading_value: 8,
        patient_id: 4,
        notes: 12,
      },
      offset: (page - 1) * pageSize,
      pageSize,
      orderBy: sortColumn
        ? [{ columnName: sortColumn, ascendent: sortDirection === "asc" }]
        : [{ columnName: "id", ascendent: true }],
      filter: {},
    };

    const response = await apiClient
      .post<ApiResponse<BloodSugarReading[]>>("/Reading/Reading", payload)
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
      reading_value: parseFloat(item.reading_value),
    }));

    const total =
      processedData.length >= pageSize
        ? page * pageSize + 1
        : (page - 1) * pageSize + processedData.length;

    return { data: processedData, total };
  },

  createReading: async (reading: Omit<BloodSugarReading, "id">) => {
    const response = await apiClient.post<ApiResponse<BloodSugarReading>>(
      "/Reading/Reading",
      reading
    );
    if (response.data.code !== 0) throw new Error("API Error");
    return response.data.data;
  },
};
