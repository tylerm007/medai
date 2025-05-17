// src/components/InsulinRule/AddInsulinRuleModal.tsx
import { useState } from "react";

interface AddInsulinRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: any) => void;
}

export const AddInsulinRuleModal = ({
  isOpen,
  onClose,
  onSave,
}: AddInsulinRuleModalProps) => {
  const [formData, setFormData] = useState({
    blood_sugar_reading: "Before_Breakfast",
    blood_sugar_level: 0,
    glargine_before_dinner: null as number | null,
    lispro_before_breakfast: null as number | null,
    lispro_before_lunch: null as number | null,
    lispro_before_dinner: null as number | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">New Insulin Rule</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Blood Sugar Reading Time
              </label>
              <select
                className="w-full p-2 border rounded-lg"
                value={formData.blood_sugar_reading}
                onChange={(e) => setFormData({ ...formData, blood_sugar_reading: e.target.value })}
                required
              >
                <option value="Before_Breakfast">Before Breakfast</option>
                <option value="Before_Lunch">Before Lunch</option>
                <option value="Before_Dinner">Before Dinner</option>
                <option value="At_Bedtime">At Bedtime</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Blood Sugar Level (mg/dL)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={formData.blood_sugar_level}
                onChange={(e) => setFormData({ ...formData, blood_sugar_level: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Glargine Before Dinner (units)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={formData.glargine_before_dinner ?? ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  glargine_before_dinner: e.target.value ? Number(e.target.value) : null 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lispro Before Breakfast (units)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={formData.lispro_before_breakfast ?? ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lispro_before_breakfast: e.target.value ? Number(e.target.value) : null 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lispro Before Lunch (units)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={formData.lispro_before_lunch ?? ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lispro_before_lunch: e.target.value ? Number(e.target.value) : null 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Lispro Before Dinner (units)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded-lg"
                value={formData.lispro_before_dinner ?? ""}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  lispro_before_dinner: e.target.value ? Number(e.target.value) : null 
                })}
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
              Create Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};