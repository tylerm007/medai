// src/components/BloodSugar/AddReadingModal.tsx
import { useState } from "react";
import { BloodSugarReading } from "@/types/bloodSugar";

interface AddReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reading: Omit<BloodSugarReading, "id">) => void;
}

export function AddReadingModal({
  isOpen,
  onClose,
  onSave,
}: AddReadingModalProps) {
  const [formData, setFormData] = useState<Omit<BloodSugarReading, "id">>({
    patient_id: "",
    time_of_reading: "Morning",
    reading_value: 0,
    reading_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_id || !formData.reading_date) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Blood Sugar Reading</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Patient ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient ID *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                value={formData.patient_id}
                onChange={(e) =>
                  setFormData({ ...formData, patient_id: e.target.value })
                }
              />
            </div>

            {/* Time of Reading */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time of Reading *
              </label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                value={formData.time_of_reading}
                onChange={(e) =>
                  setFormData({ ...formData, time_of_reading: e.target.value })
                }
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </div>

            {/* Reading Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Sugar Value (mg/dL) *
              </label>
              <input
                type="number"
                required
                min="0"
                max="500"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                value={formData.reading_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reading_value: Number(e.target.value),
                  })
                }
              />
            </div>

            {/* Reading Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Reading *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                value={formData.reading_date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setFormData({ ...formData, reading_date: e.target.value })
                }
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-medical-primary"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-primary-dark transition-colors"
              >
                Save Reading
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
