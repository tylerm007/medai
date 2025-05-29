// app/patient/[id]/edit/page.tsx
"use client";
import { use, useEffect } from "react";
import PatientForm from "@/components/PatientForm";
import { usePatient } from "@/hooks/usePatient";
import { useBloodSugarReadings } from "@/hooks/useBloodSugarReadings";
import { useRecommendations } from "@/hooks/useRecommendations";
import { usePatients } from "@/hooks/usePatients";
import LoadingSpinner from "@/components/Auth/LoadingSpinner";
import { usePageTitle } from "@/context/PageTitleContext";

export default function EditPatient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);

  // Replicate EXACT PatientDetail data fetching pattern
  const { patients } = usePatients();
  const { readings = [] } = useBloodSugarReadings(undefined, patients);
  const { recommendations, drugTypes } = useRecommendations();
  const { patient, loading, error } = usePatient(id);

  const { setTitle } = usePageTitle();

  // 1:1 COPY from PatientDetail -------------------------------------------
  const getLatestReadings = () => {
    if (!readings || !id) return {};
    const seenTimes = new Set<string>();
    const patientReadings = readings
      .filter((reading) => reading.patient_id === id)
      .sort(
        (a, b) =>
          new Date(b.reading_date).getTime() -
          new Date(a.reading_date).getTime()
      );

    const latestReadings: Record<string, string> = {};
    patientReadings.forEach((reading) => {
      const timeKey = reading.time_of_reading.toString();
      if (!seenTimes.has(timeKey)) {
        latestReadings[timeKey] = Number(reading.reading_value).toFixed(0);
        seenTimes.add(timeKey);
      }
    });
    return latestReadings;
  };

  const getMedicationData = () => {
    if (!recommendations || !drugTypes || !id) return [];
    const drugMap = new Map(drugTypes.map((drug) => [drug.id, drug.drug_name]));
    return recommendations
      .filter((rec) => rec.patient_id === id && drugMap.has(rec.drug_id))
      .map((rec) => ({
        drugName: drugMap.get(rec.drug_id) || "Unknown Drug",
        dosage: `${Number(rec.dosage).toFixed(0)} ${rec.dosage_unit}`,
        time: rec.time_of_reading,
      }));
  };

  const groupMedications = () => {
    const medications = getMedicationData();
    const grouped: Record<string, Record<string, string>> = {};
    medications.forEach((med) => {
      if (!grouped[med.drugName]){
        grouped[med.drugName] = {};
      }
      grouped[med.drugName][med.time] = med.dosage;
    });
    return Object.entries(grouped).map(([drug, times]) => ({
      drug,
      breakfast: times.breakfast || "-",
      lunch: times.lunch || "-",
      dinner: times.dinner || "-",
    }));
  };

  const getInsulinData = () => {
    if (!recommendations || !drugTypes || !id) return [];
    const drugMap = new Map(drugTypes.map((drug) => [drug.id, drug.drug_name]));
    const insulinDrugs = ["Glargine", "Lispro"];
    return recommendations
      .filter((rec) => {
        const drugName = drugMap.get(rec.drug_id) || "";
        return rec.patient_id === id && insulinDrugs.includes(drugName);
      })
      .map((rec) => ({
        drugName: drugMap.get(rec.drug_id) || "Unknown Insulin",
        dosage: `${Number(rec.dosage).toFixed(0)} ${rec.dosage_unit}`,
        time: rec.time_of_reading,
      }));
  };

  const groupInsulinData = () => {
    const insulinMeds = getInsulinData();
    const grouped: Record<string,  Record<string,string>> = {};
    insulinMeds.forEach((med) => {
      if (!grouped[med.drugName]) {
        grouped[med.drugName] = {};
      }
      grouped[med.drugName][med.time] = med.dosage;
      
    });
    return Object.entries(grouped).map(([drug, times]) => ({
      drug,
      breakfast: times.breakfast || "-",
      lunch: times.lunch || "-",
      dinner: times.dinner || "-",
      bedtime: times.bedtime || "-",
    }));
  };
  // END of 1:1 COPY ------------------------------------------------------

  useEffect(() => {
    if (patient){
      setTitle(`Editing ${patient.name}`);
    }
  }, [patient, setTitle]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!patient) return <div className="p-6">Patient not found</div>;

  // Prepare IDENTICAL data structure as PatientDetail
  const formData = {
    ...patient,
    birth_date: patient?.birth_date
      ? new Date(patient.birth_date).toISOString().split("T")[0]
      : "",
    latestReadings: getLatestReadings(),
    medications: groupMedications(),
    insulinData: groupInsulinData(),
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">
        Edit Patient Profile
      </h1>
      {/* Pass ALL data through spread operator */}
      <PatientForm initialData={formData} />
    </div>
  );
}
