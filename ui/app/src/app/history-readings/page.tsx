// src/app/history-readings/page.tsx
"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePageTitle } from "@/context/PageTitleContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import LoadingSpinner from "@/components/Auth/LoadingSpinner";
import SearchInput from "@/components/Search/SearchInput";
import { DataTable } from "@/components/DataTable/DataTable";
import { AddHistoryModal } from "@/components/ReadingHistory/AddReadingHistoryModal";
import { usePatients } from "@/hooks/usePatients";
import { usePatientReadingHistories } from "@/hooks/usePatientReadingHistories";
import { ColumnDef } from "@/components/DataTable/DataTable";
import type { PatientReadingHistory } from "@/types/patientReadingHistory";
import { RefreshButton } from "@/components/RefreshButton";

export default function HistoryReadingsPage() {
  const { setTitle } = usePageTitle();
  const { patients } = usePatients();
  const {
    histories = [],
    loading,
    totalCount,
    error,
    currentPage,
    handlePageChange,
    searchInput,
    handleSearch,
    handleSort,
    createHistory,
    refresh,
    sortBy,
    sortDirection,
    updateHistory,
  } = usePatientReadingHistories(undefined, patients);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setTitle("Daily Reading Histories");
  }, [setTitle]);

  const patientLookup = useMemo(() => {
    return patients.reduce((acc: Record<number, string>, patient) => {
      acc[patient.id] = patient.name;
      return acc;
    }, {});
  }, [patients]);

  const columns: ColumnDef<PatientReadingHistory>[] = [
    {
      key: "id",
      header: "History ID",
      sortable: true,
    },
    {
      key: "patient_id",
      header: "Patient",
      sortable: true,
      cellRenderer: (row) => (
        <Link
          href={`/patient/${row.patient_id}`}
          className="text-medical-primary dark:text-gray-400 hover:underline"
        >
          {patientLookup[row.patient_id]}
        </Link>
      ),
    },
    {
      key: "reading_date",
      header: "Date",
      sortable: true,
      editable: true,
      inputType: "date",
      cellRenderer: (row) => {
        const date = new Date(row.reading_date);
        return `${
          date.getUTCMonth() + 1
        }/${date.getUTCDate()}/${date.getUTCFullYear()}`;
      },
    },
    {
      key: "breakfast",
      header: "Breakfast (mg/dL)",
      sortable: true,
      align: "right",
      editable: true,
      inputType: "number",
      cellRenderer: (row) => (
        <span className="text-gray-700 dark:text-gray-400">
          {row.breakfast || "–"}
        </span>
      ),
    },
    {
      key: "lunch",
      header: "Lunch (mg/dL)",
      sortable: true,
      align: "right",
      editable: true,
      inputType: "number",
      cellRenderer: (row) => (
        <span className="text-gray-700 dark:text-gray-400">
          {row.lunch || "–"}
        </span>
      ),
    },
    {
      key: "dinner",
      header: "Dinner (mg/dL)",
      sortable: true,
      align: "right",
      editable: true,
      cellRenderer: (row) => (
        <span className="text-gray-700 dark:text-gray-400">
          {row.dinner || "–"}
        </span>
      ),
    },
    {
      key: "bedtime",
      header: "Bedtime (mg/dL)",
      sortable: true,
      align: "right",
      editable: true,
      cellRenderer: (row) => (
        <span className="text-gray-700 dark:text-gray-400">
          {row.bedtime || "–"}
        </span>
      ),
    },
    {
      key: "notes_for_day",
      header: "Daily Notes",
      editable: true,
      cellRenderer: (row) => row.notes_for_day || "–",
    },
  ];

  const handleAddHistory = async (
    newHistory: Omit<PatientReadingHistory, "id">
  ) => {
    try {
      await createHistory(newHistory);
      setShowAddModal(false);
    } catch (err) {
      console.error("Failed to add history:", err);
    }
  };

  const handleUpdateHistory = async (
    id: number,
    updates: Record<string, any>
  ) => {
    try {
      // Convert dates to UTC format
      const formattedUpdates = Object.entries(updates).reduce(
        (acc, [key, value]) => {
          if (key === "reading_date" && typeof value === "string") {
            const date = new Date(value);
            acc[key] = date.toISOString();
          } else {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      await updateHistory(id, formattedUpdates);
      await refresh();
    } catch (err) {
      console.error("Failed to update history:", err);
      throw err;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ProtectedRoute>
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <nav className="mt-2 text-sm">
              <Link
                href="/patient"
                className="text-medical-primary hover:underline"
              >
                Patient
              </Link>
              <span className="text-gray-500 mx-2">/</span>
              <span className="text-gray-500">Daily Reading Histories</span>
            </nav>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <SearchInput
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search histories..."
              className="flex-1"
            />
            <RefreshButton onClick={refresh} className="flex items-center" />
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

        {/* Data Table */}
        {error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        ) : (
          <DataTable<PatientReadingHistory>
            columns={columns}
            data={histories}
            totalCount={totalCount}
            sortConfig={
              sortBy
                ? {
                    key: sortBy,
                    direction: sortDirection || "desc",
                  }
                : undefined
            }
            onSort={handleSort}
            currentPage={currentPage}
            itemsPerPage={10}
            onPageChange={handlePageChange}
            onUpdate={handleUpdateHistory}
          />
        )}

        <AddHistoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddHistory}
        />
      </div>
    </ProtectedRoute>
  );
}
