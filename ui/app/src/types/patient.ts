export interface Patient {
  insulinData: InsulinRule[];
  medications: Medications[];
  latestReadings: Reading[];
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

export interface InsulinRule {
  id: number;
  patient_id: number;
} 

export interface Medications  {
  id: number;
  patient_id: number;
}

export interface Reading {
  id: number;   
  patient_id: number;
  time_of_reading: string;
  reading_value: number;
  reading_date: string;
  notes: string;
}