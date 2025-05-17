// src/components/Lab/AddLabModal.tsx
import { useState } from "react";
import type { PatientLab } from "@/types/patientLab";
import { usePatients } from "@/hooks/usePatients";

interface AddLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lab: Omit<PatientLab, "id">) => void;
}

export function AddLabModal({ isOpen, onClose, onSave }: AddLabModalProps) {
  const { patients } = usePatients();
  const [form, setForm] = useState<Omit<PatientLab, "id">>({
    patient_id: 0,
    lab_name: "",
    lab_test_name: "",
    lab_test_code: "",
    lab_test_description: "",
    lab_date: new Date().toISOString().split("T")[0],
    lab_result: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Add New Lab Result</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Patient *</label>
              <select
                required
                className="w-full p-2 border rounded"
                value={form.patient_id}
                onChange={(e) =>
                  setForm({ ...form, patient_id: Number(e.target.value) })
                }
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Lab Name *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={form.lab_name}
                onChange={(e) => setForm({ ...form, lab_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Test Name *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={form.lab_test_name}
                onChange={(e) =>
                  setForm({ ...form, lab_test_name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2">Test Code *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={form.lab_test_code}
                onChange={(e) =>
                  setForm({ ...form, lab_test_code: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block mb-2">Date *</label>
              <input
                type="date"
                required
                className="w-full p-2 border rounded"
                value={form.lab_date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, lab_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block mb-2">Result *</label>
              <input
                type="text"
                required
                className="w-full p-2 border rounded"
                value={form.lab_result}
                onChange={(e) =>
                  setForm({ ...form, lab_result: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Description</label>
            <textarea
              rows={3}
              className="w-full p-2 border rounded"
              value={form.lab_test_description}
              onChange={(e) =>
                setForm({ ...form, lab_test_description: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-medical-primary text-white rounded hover:bg-medical-primary-dark"
            >
              Save Lab Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
