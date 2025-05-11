// src/components/DataTable/DataTable.tsx
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import { ReactNode } from "react";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  sortConfig?: SortConfig;
  onSort?: (key: keyof T) => void;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export interface ColumnDef<T> {
  key: keyof T;
  header: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  cellRenderer?: (row: T) => ReactNode;
}

interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export function DataTable<T>({
  columns,
  data,
  sortConfig,
  onSort,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                      ? "text-center"
                      : "text-left"
                  } ${
                    column.sortable ? "cursor-pointer hover:bg-gray-100" : ""
                  }`}
                  onClick={() =>
                    column.sortable && onSort?.(column.key as keyof T)
                  }
                >
                  <div
                    className={`flex ${
                      column.align === "right"
                        ? "justify-end"
                        : column.align === "center"
                        ? "justify-center"
                        : ""
                    }`}
                  >
                    {column.header}
                    {column.sortable && sortConfig?.key === column.key && (
                      <span className="ml-2">
                        {sortConfig.direction === "asc" ? (
                          <ArrowUpIcon className="w-4 h-4" />
                        ) : (
                          <ArrowDownIcon className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key as string}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                        ? "text-center"
                        : "text-gray-900"
                    }`}
                  >
                    {column.cellRenderer
                      ? column.cellRenderer(row)
                      : (row[column.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
          results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="px-3 py-1.5 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
