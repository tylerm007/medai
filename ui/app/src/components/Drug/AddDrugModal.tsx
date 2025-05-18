// src/components/Drug/AddDrugModal.tsx
import { Drug } from "@/types/drug";
import { useState } from "react";

interface AddDrugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (drug: Omit<Drug, "id">) => void;
}

export const AddDrugModal = ({
  isOpen,
  onClose,
  onSave,
}: AddDrugModalProps) => {  
  const [formData, setFormData] = useState<Omit<Drug, "id">>({
    drug_name: "",
    dosage: 0,
    dosage_unit: "mg",
    drug_type: "Oral",
    manufacturer: "",
    side_effects: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      dosage: Number(formData.dosage),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">New Drug</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-2">Dosage</label>
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border rounded-lg"
                value={formData.dosage}
                onChange={(e) =>
                  setFormData({ ...formData, dosage: Number(e.target.value) })
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
                <option value="Inhalation">Inhalation</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={formData.manufacturer}
                onChange={(e) =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">
                Side Effects
              </label>
              <textarea
                className="w-full p-2 border rounded-lg"
                value={formData.side_effects || ""}
                onChange={(e) =>
                  setFormData({ ...formData, side_effects: e.target.value })
                }
                rows={3}
              />
            </div>
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
              Create Drug
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
