'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ColumnConfig<T> {
  id: keyof T;
  header: string;
  cell?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  width?: string;
}

interface DataTableProps<T extends Record<string, any>> {
  columns: ColumnConfig<T>[];
  data: T[];
  searchable?: boolean;
  filterable?: boolean;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export const DataTable = React.forwardRef<
  HTMLDivElement,
  DataTableProps<any>
>(
  (
    { columns, data, searchable = true, filterable = true, className },
    ref
  ) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

    // Filter and search
    const filteredData = useMemo(() => {
      if (!searchTerm) return data;

      return data.filter((row) => {
        return columns.some((col) => {
          if (!col.searchable) return false;
          const value = row[col.id];
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
      });
    }, [data, searchTerm, columns]);

    // Sort
    const sortedData = useMemo(() => {
      if (!sortColumn || !sortDirection) return filteredData;

      const sorted = [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === bValue) return 0;

        const isAsc = sortDirection === 'asc';
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return isAsc ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return isAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });

      return sorted;
    }, [filteredData, sortColumn, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = useMemo(() => {
      const start = (currentPage - 1) * pageSize;
      return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize]);

    const handleSort = (columnId: string) => {
      if (sortColumn === columnId) {
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortColumn(null);
          setSortDirection(null);
        }
      } else {
        setSortColumn(columnId);
        setSortDirection('asc');
      }
    };

    const toggleRowSelection = (index: number) => {
      const newSelection = new Set(selectedRows);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      setSelectedRows(newSelection);
    };

    const toggleAllRows = () => {
      if (selectedRows.size === paginatedData.length) {
        setSelectedRows(new Set());
      } else {
        const allIndices = new Set(paginatedData.map((_, i) => i));
        setSelectedRows(allIndices);
      }
    };

    const handleExportCSV = () => {
      const csv = [
        columns.map((col) => col.header).join(','),
        ...sortedData.map((row) =>
          columns
            .map((col) => {
              const value = row[col.id];
              return typeof value === 'string'
                ? `"${value.replace(/"/g, '""')}"`
                : value;
            })
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const getSortIcon = (columnId: string) => {
      if (sortColumn !== columnId) return <ChevronsUpDown size={16} />;
      if (sortDirection === 'asc') return <ChevronUp size={16} />;
      return <ChevronDown size={16} />;
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)}>
        {/* Toolbar */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {searchable && (
            <div className="relative flex-1 md:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Axtar..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              CSV Yükləmə
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-300 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.size === paginatedData.length
                    }
                    onChange={toggleAllRows}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                {columns.map((col) => (
                  <th
                    key={String(col.id)}
                    className={cn(
                      'px-6 py-3 text-left text-gray-700 dark:text-gray-300 font-semibold',
                      col.sortable && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700',
                      col.width
                    )}
                    style={{ width: col.width }}
                  >
                    <div
                      className="flex items-center gap-2"
                      onClick={() =>
                        col.sortable && handleSort(String(col.id))
                      }
                    >
                      <span>{col.header}</span>
                      {col.sortable && getSortIcon(String(col.id))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIdx)}
                      onChange={() => toggleRowSelection(rowIdx)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={String(col.id)}
                      className="px-6 py-4 text-gray-700 dark:text-gray-300"
                      style={{ width: col.width }}
                    >
                      {col.cell ? col.cell(row[col.id], row) : row[col.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {sortedData.length === 0 ? (
              <span>Heç bir nəticə tapılmadı</span>
            ) : (
              <span>
                Cəmi {sortedData.length} - Səhifə {currentPage} / {totalPages}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value={10}>10 cərgə</option>
              <option value={25}>25 cərgə</option>
              <option value={50}>50 cərgə</option>
            </select>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';
