// src/components/Dosage/AddDosageModal.tsx
import { useState } from "react";
import type { Dosage } from "@/types/dosage";

interface AddDosageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dosage: Omit<Dosage, "id">) => void;
}

export const AddDosageModal = ({
  isOpen,
  onClose,
  onSave,
}: AddDosageModalProps) => {
  const [formData, setFormData] = useState<Omit<Dosage, "id">>({
    drug_id: 0,
    drug_name: "",
    dosage_unit: "mg",
    drug_type: "Oral",
    min_dose: null,
    max_dose: null,
    min_age: null,
    max_age: null,
    min_weight: null,
    max_weight: null,
    min_creatine: null,
    max_creatine: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      drug_id: Number(formData.drug_id),
      min_dose: formData.min_dose ? Number(formData.min_dose) : null,
      max_dose: formData.max_dose ? Number(formData.max_dose) : null,
      min_age: formData.min_age ? Number(formData.min_age) : null,
      max_age: formData.max_age ? Number(formData.max_age) : null,
      min_weight: formData.min_weight ? Number(formData.min_weight) : null,
      max_weight: formData.max_weight ? Number(formData.max_weight) : null,
      min_creatine: formData.min_creatine
        ? Number(formData.min_creatine)
        : null,
      max_creatine: formData.max_creatine
        ? Number(formData.max_creatine)
        : null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">New Dosage Guidelines</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Drug ID</label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={formData.drug_id}
                onChange={(e) =>
                  setFormData({ ...formData, drug_id: Number(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Drug Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={formData.drug_name}
                onChange={(e) =>
                  setFormData({ ...formData, drug_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Dosage Unit
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={formData.dosage_unit}
                onChange={(e) =>
                  setFormData({ ...formData, dosage_unit: e.target.value })
                }
              >
                <option value="mg">mg</option>
                <option value="ml">ml</option>
                <option value="g">g</option>
                <option value="units">units</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Drug Type
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={formData.drug_type}
                onChange={(e) =>
                  setFormData({ ...formData, drug_type: e.target.value })
                }
              >
                <option value="Oral">Oral</option>
                <option value="Injectable">Injectable</option>
                <option value="Topical">Topical</option>
              </select>
            </div>

            {/* Range Inputs */}
            {["dose", "age", "weight", "creatine"].map((field) => (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Min {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="number"
                    step={field === "age" ? "1" : "0.1"}
                    className="w-full p-2 border rounded-lg"
                    value={
                      formData[`min_${field}` as keyof typeof formData] || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`min_${field}`]: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Max {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="number"
                    step={field === "age" ? "1" : "0.1"}
                    className="w-full p-2 border rounded-lg"
                    value={
                      formData[`max_${field}` as keyof typeof formData] || ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [`max_${field}`]: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                  />
                </div>
              </>
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-primary-dark"
            >
              Create Dosage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
