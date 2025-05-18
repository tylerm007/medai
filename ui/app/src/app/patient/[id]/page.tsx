"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { usePageTitle } from "@/context/PageTitleContext";
import { usePatient } from "@/hooks/usePatient";
import LoadingSpinner from "@/components/Auth/LoadingSpinner";

export default function PatientDetail() {
  const { id } = useParams();
  const { setTitle } = usePageTitle();

  const { patient, loading, error } = usePatient(Number(id));

  console.log("patient", patient);

  useEffect(() => {
    if (patient) setTitle(patient.name);
  }, [patient, setTitle]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!patient) return <div className="p-6">Patient not found</div>;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <nav className="text-sm text-gray-600 mb-2">
          <ul className="flex space-x-2">
            <li>
              <Link href="/patient" className="hover:underline text-blue-600">
                Dashboard
              </Link>
              <span className="mx-1">/</span>
            </li>
            <li>
              <Link href="/patient" className="hover:underline text-blue-600">
                Patient
              </Link>
              <span className="mx-1">/</span>
            </li>
            <li className="font-medium text-gray-900">Patient Details</li>
          </ul>
        </nav>

        {/* Patient Header */}
        <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-4 gap-8 items-center">
          {/* Left Box: Patient Image & Name */}
          <div className="col-span-1 flex flex-col items-center text-center md:border-r md:border-gray-300 md:pr-6 justify-center h-full">
            <div className="mb-4">
              <img
                src={
                  patient.patient_sex === "F"
                    ? "/patient-details/female.svg"
                    : "/patient-details/male.svg"
                }
                alt={patient.patient_sex === "F" ? "Female" : "Male"}
                className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-md object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.name}
              </h1>
              <p className="text-gray-500 text-base mt-1">
                mariawaston2022@gmail.com
              </p>
            </div>
          </div>

          {/* Right Box: Doctor Info & Patient Metadata */}
          <div className="col-span-3 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <InfoItem label="First Name" value={patient.name.slice(0,7)} />
              <InfoItem label="Last Name" value={patient.name.slice(8)} />
              <InfoItem label="Weight" value={patient.weight} />

              <InfoItem label="Height" value={patient.height} />
              <InfoItem label="BMI" value={"-"} />
              <InfoItem label="HbA1c" value={"-"} />

              <InfoItem label="EGFR" value={"-"} />
              <InfoItem label="Creatinine" value={"-"} />
            </div>
          </div>
        </div>

        {/* Current Vitals */}
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold mb-4">
            BloodSugars/Fingerstick
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <VitalItem
              label="Before Breakfast"
              value="120"
              sub="mg/dL"
              status="normal"
            />
            <VitalItem
              label="Before Lunch"
              value="120"
              sub="mg/dl"
              status="abnormal"
            />
            <VitalItem
              label="Before Dinner"
              value="97"
              sub="mg/dl"
              status="normal"
            />
            <VitalItem
              label="Before Bedtime"
              value="85"
              sub="mg/dl"
              status="normal"
            />
          </div>
        </div>

        {/* Patient Recommendations / Medications */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Recommendations / Medications
            </h2>
            <span className="text-gray-600">Total {patient.name} Visits</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="pb-3">DOSE/mg</th>
                  <th className="pb-3">BreakFast</th>
                  <th className="pb-3">Lunch</th>
                  <th className="pb-3">Dinner</th>
                </tr>
              </thead>
              <tbody>
                {/* Medications Section */}
                <tr className="border-b">
                  <td className="py-4 font-medium">Metformin</td>
                  <td>500 mg</td>
                  <td>500 mg</td>
                  <td>1000 mg</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 font-medium">Aspirin</td>
                  <td>81 mg</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 font-medium">Atorvastatin</td>
                  <td>-</td>
                  <td>-</td>
                  <td>40 mg</td>
                </tr>

                {/* Chronic Conditions Status */}
                <tr className="border-b">
                  <td className="py-4 font-medium">Condition Monitor</td>
                  <td colSpan={3}>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">CAD:</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            patient.cad
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {patient.cad ? "Present" : "Absent"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">CKD:</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            patient.ckd
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {patient.ckd ? "Present" : "Absent"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">HLD:</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            patient.hld
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {patient.hld ? "Present" : "Absent"}
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>

                {/* Key Metrics */}
                <tr>
                  <td className="py-4 font-medium">HbA1c</td>
                  <td colSpan={3}>
                    <div className="flex items-center gap-4">
                      <span>{patient.hba1c}%</span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          parseFloat(patient.hba1c) > 6.5
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {parseFloat(patient.hba1c) > 6.5 ? "High" : "Normal"}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Insulin Section */}
        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Insulin</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="pb-3">Units</th>
                  <th className="pb-3">Before BreakFast</th>
                  <th className="pb-3">Before Lunch</th>
                  <th className="pb-3">Before Dinner</th>
                  <th className="pb-3">Before Bed Time</th>
                </tr>
              </thead>
              <tbody>
                {/* Example row, update with dynamic data if needed */}
                <tr className="border-b">
                  <td className="py-4 font-medium">Humalog</td>
                  <td>10 units</td>
                  <td>8 units</td>
                  <td>6 units</td>
                  <td>12 units</td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 font-medium">Lantus</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>20 units</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Nutrition & Exercise Section */}
        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Nutrition & Exercise</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 font-medium">Diet</td>
                  <td>Less Starches/Carbohydrate</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium">Exercise</td>
                  <td>7000 Steps Daily</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Info display components
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value?: string | number;
}) => (
  <div className="flex flex-col justify-between items-start p-4 gap-y-3">
    <span className="text-gray-500">{label}</span>
    <span className="font-semibold text-gray-900">{value || "-"}</span>
  </div>
);

const VitalItem = ({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub: string;
  status: "normal" | "abnormal";
}) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <h3 className="text-black text-base mb-2">{label}</h3>
    <div className="mb-2 flex flex-row items-baseline">
      <span className="text-3xl font-semibold">{value}</span>
      <span className="text-gray-500 font-medium ml-1">{sub}</span>
    </div>
    <div className="flex justify-between items-center">
      <span
        className={`text-sm ${
          status === "normal" ? "text-green-600" : "text-red-600"
        }`}
      >
        {status === "normal" ? "in the norm" : "Above the norm"}
      </span>
    </div>
  </div>
);