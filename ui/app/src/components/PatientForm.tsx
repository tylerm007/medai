// components/PatientForm.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Patient } from "@/types/patient";
import FormField from "@/components/FormField";
import { PatientService } from "@/lib/api/patientService";
import toast from "react-hot-toast";

interface Reading {
  time: string;
  value: string;
}

interface Medication {
  drug: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface Insulin {
  drug: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  bedtime: string;
}

export default function PatientForm({
  initialData,
}: {
  initialData?: Patient;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Patient>>(initialData || {});
  const [readings, setReadings] = useState<Reading[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [insulinData, setInsulinData] = useState<Insulin[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);

      // Initialize blood sugar readings
      if (initialData.latestReadings) {
        const readingsArray = Object.entries(initialData.latestReadings).map(
          ([time, value]) => ({
            time,
            value: String(value),
          })
        );
        setReadings(readingsArray);
      }

      // Initialize medications
      if (initialData.medications) {
        setMedications(initialData.medications);
      }

      // Initialize insulin data
      if (initialData.insulinData) {
        setInsulinData(initialData.insulinData);
      }
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!initialData?.id) throw new Error("Patient ID missing");

      const { latestReadings, medications, insulinData, ...patientData } =
        formData;

      await PatientService.updatePatient(initialData.id, patientData);

      // Success toast
      toast.success("Patient updated successfully!", {
        icon: "✅",
        position: "top-right",
        style: {
          background: "#f0fff4",
          color: "#38a169",
          padding: "16px",
          borderRadius: "8px",
        },
      });

      router.push(`/patient/${initialData.id}`);
      router.refresh();
    } catch (err: any) {
      // Error toast
      toast.error(`Update failed: ${err.message}`, {
        icon: "❌",
        position: "top-right",
        style: {
          background: "#fff5f5",
          color: "#e53e3e",
          padding: "16px",
          borderRadius: "8px",
        },
      });

      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const validateForm = () => {
      const errors = [];
      if (!formData.name) errors.push("Name is required");
      if (!formData.birth_date) errors.push("Birth date is required");
      if (formData.weight && formData.weight < 0) errors.push("Invalid weight");

      if (errors.length > 0) {
        setError(errors.join(", "));
      } else {
        setError("");
      }
    };

    validateForm();
  }, [formData]);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReadingChange = (time: string, value: string) => {
    setReadings((prev) => [
      ...prev.filter((r) => r.time !== time),
      { time, value },
    ]);
  };

  const handleMedicationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setMedications((prev) => {
      const newMedications = [...prev];
      newMedications[index] = { ...newMedications[index], [field]: value };
      return newMedications;
    });
  };

  const addMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        drug: "",
        breakfast: "",
        lunch: "",
        dinner: "",
      },
    ]);
  };

  const bmi =
    formData.height && formData.weight
      ? (formData.weight / (formData.height / 100) ** 2).toFixed(1)
      : "-";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && <div className="p-4 text-red-500">{error}</div>}

      {/* Patient Header Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
        {/* Image Upload */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="mb-4 relative group">
            <img
              src={
                formData.patient_sex === "F"
                  ? "/patient-details/female.svg"
                  : "/patient-details/male.svg"
              }
              alt="Patient"
              className="w-32 h-32 rounded-full border-4 border-blue-200"
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="col-span-3 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormField
              label="Full Name"
              value={formData.name || ""}
              onChange={(v) => handleChange("name", v)}
              required
            />
            <FormField
              label="Birth Date"
              type="date"
              value={formData.birth_date || ""}
              onChange={(v) => handleChange("birth_date", v)}
              required
            />
            <FormField
              label="Gender"
              type="select"
              options={["M", "F"]}
              value={formData.patient_sex || ""}
              onChange={(v) => handleChange("patient_sex", v)}
              required
            />
            <FormField
              label="Weight (kg)"
              type="number"
              value={formData.weight || ""}
              onChange={(v) => handleChange("weight", Number(v))}
            />
            <FormField
              label="Height (cm)"
              type="number"
              value={formData.height || ""}
              onChange={(v) => handleChange("height", Number(v))}
            />
            <div className="bg-gray-100 p-4 rounded-lg">
              <span className="font-medium">BMI: {bmi}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6">Medical Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              label="HbA1c (%)"
              type="number"
              step="0.1"
              value={formData.hba1c || ""}
              onChange={(v) => handleChange("hba1c", v)}
              validate={(v) => {
                const value = parseFloat(v);
                if (value < 4 || value > 20) return "Must be between 4-20%";
                return null;
              }}
            />
            <FormField
              label="Creatinine (mg/dL)"
              type="number"
              step="0.01"
              value={formData.creatine_mg_dl || ""}
              onChange={(v) => handleChange("creatine_mg_dl", Number(v))}
            />
          </div>
          <div className="space-y-4">
            <FormField
              label="Duration (years)"
              type="number"
              value={formData.duration || ""}
              onChange={(v) => handleChange("duration", Number(v))}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="CAD"
                type="select"
                options={["Yes", "No"]}
                value={formData.cad || ""}
                onChange={(v) => handleChange("cad", v)}
              />
              <FormField
                label="CKD"
                type="select"
                options={["Yes", "No"]}
                value={formData.ckd || ""}
                onChange={(v) => handleChange("ckd", v)}
              />
              <FormField
                label="HLD"
                type="select"
                options={["Yes", "No"]}
                value={formData.hld || ""}
                onChange={(v) => handleChange("hld", v)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Blood Sugar Readings */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6">Blood Sugar Readings</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["breakfast", "lunch", "dinner", "bedtime"].map((time) => (
            <FormField
              key={time}
              label={`Before ${time.charAt(0).toUpperCase() + time.slice(1)}`}
              type="number"
              value={readings.find((r) => r.time === time)?.value || ""}
              onChange={(v) => handleReadingChange(time, v)}
              sub="mg/dL"
            />
          ))}
        </div>
      </div>

      {/* Medications Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Medications</h2>
          <button
            type="button"
            onClick={addMedication}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add Medication
          </button>
        </div>
        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-end">
              <FormField
                label="Drug Name"
                value={med.drug}
                onChange={(v) => handleMedicationChange(index, "drug", v)}
              />
              <FormField
                label="Breakfast"
                value={med.breakfast}
                onChange={(v) => handleMedicationChange(index, "breakfast", v)}
                sub="mg"
              />
              <FormField
                label="Lunch"
                value={med.lunch}
                onChange={(v) => handleMedicationChange(index, "lunch", v)}
                sub="mg"
              />
              <FormField
                label="Dinner"
                value={med.dinner}
                onChange={(v) => handleMedicationChange(index, "dinner", v)}
                sub="mg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Insulin Section */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-6">Insulin</h2>
        <div className="space-y-4">
          {insulinData.map((insulin, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-end">
              <FormField
                label="Insulin Type"
                value={insulin.drug}
                onChange={(v) =>
                  setInsulinData((prev) => {
                    const newData = [...prev];
                    newData[index].drug = v;
                    return newData;
                  })
                }
              />
              <FormField
                label="Breakfast"
                value={insulin.breakfast}
                onChange={(v) =>
                  setInsulinData((prev) => {
                    const newData = [...prev];
                    newData[index].breakfast = v;
                    return newData;
                  })
                }
                sub="units"
              />
              <FormField
                label="Lunch"
                value={insulin.lunch}
                onChange={(v) =>
                  setInsulinData((prev) => {
                    const newData = [...prev];
                    newData[index].lunch = v;
                    return newData;
                  })
                }
                sub="units"
              />
              <FormField
                label="Dinner"
                value={insulin.dinner}
                onChange={(v) =>
                  setInsulinData((prev) => {
                    const newData = [...prev];
                    newData[index].dinner = v;
                    return newData;
                  })
                }
                sub="units"
              />
              <FormField
                label="Bedtime"
                value={insulin.bedtime}
                onChange={(v) =>
                  setInsulinData((prev) => {
                    const newData = [...prev];
                    newData[index].bedtime = v;
                    return newData;
                  })
                }
                sub="units"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setInsulinData((prev) => [
                ...prev,
                {
                  drug: "",
                  breakfast: "",
                  lunch: "",
                  dinner: "",
                  bedtime: "",
                },
              ])
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add Insulin
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          {isSubmitting ? "Saving..." : "Save Patient"}
        </button>
      </div>
    </form>
  );
}
