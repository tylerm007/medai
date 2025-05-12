// src/types/bloodSugar.ts
export interface BloodSugarReading {
  id: string;
  patient_id: string;
  time_of_reading: string;
  reading_value: number;
  reading_date: string;
  notes: string;
}

export const mockData: BloodSugarReading[] = Array.from(
  { length: 45 },
  (_, i) => ({
    id: `BSR${String(i + 1).padStart(4, "0")}`,
    patient_id: `PID${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(4, "0")}`,
    time_of_reading: ["Morning", "Afternoon", "Evening", "Night"][i % 4],
    reading_value: Math.floor(Math.random() * 300) + 40,
    reading_date: `2024-02-${String((i % 28) + 1).padStart(2, "0")}`,
    notes:
      i % 3 === 0
        ? "Fasting reading"
        : i % 4 === 0
        ? "Postprandial reading"
        : "",
  })
);
