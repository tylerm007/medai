// src/app/drug-units/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePageTitle } from "@/context/PageTitleContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import LoadingSpinner from "@/components/Auth/LoadingSpinner";
import SearchInput from "@/components/Search/SearchInput";
import { DataTable, ColumnDef } from "@/components/DataTable/DataTable";
import { AddDrugUnitModal } from "@/components/DrugUnit/AddDrugUnitModal";
import { useDrugUnits } from "@/hooks/useDrugUnits";
import type { DrugUnit } from "@/types/drugUnit";

export default function DrugUnitsPage() {
  const { setTitle } = usePageTitle();
  const {
    units,
    loading,
    error,
    totalCount,
    searchInput,
    handleSearch,
    currentPage,
    handlePageChange,
    createDrugUnit,
    refresh,
  } = useDrugUnits();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setTitle("Drug Unit Management");
  }, [setTitle]);

  const columns: ColumnDef<DrugUnit>[] = [
    {
      key: "unit_name",
      header: "Unit Name",
      sortable: true,
    },
  ];

  const handleAddUnit = async (unit: DrugUnit) => {
    try {
      await createDrugUnit(unit);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add drug unit:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute>
      <div className="w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <nav className="mt-2 text-sm">
              <Link href="/" className="text-medical-primary hover:underline">
                Home
              </Link>
              <span className="text-gray-500 mx-2">/</span>
              <span className="text-gray-500">Drug Units</span>
            </nav>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <SearchInput
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search drug units..."
              className="flex-1"
            />
            <button
              onClick={refresh}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-medical-primary text-white rounded-lg hover:bg-medical-primary-dark flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <DataTable<DrugUnit>
            columns={columns}
            data={units}
            totalCount={totalCount}
            currentPage={currentPage}
            itemsPerPage={10}
            onPageChange={handlePageChange}
          />
        )}

        <AddDrugUnitModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddUnit}
        />
      </div>
    </ProtectedRoute>
  );
}
