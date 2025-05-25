export interface Patient {
  insulinData: any;
  medications: any;
  latestReadings: any;
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
