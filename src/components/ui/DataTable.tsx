import React, { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  RefreshCw,
  Settings,
} from 'lucide-react';

import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';
import { Checkbox } from './Checkbox';
import { cn } from '@/lib/utils';

// Define types for react-table v8 compatibility
type ColumnFiltersState = Array<{
  id: string;
  value: unknown;
}>;

type SortingState = Array<{
  id: string;
  desc: boolean;
}>;

type VisibilityState = Record<string, boolean>;

type ColumnDef<TData, TValue = unknown> = {
  id?: string;
  accessorKey?: keyof TData | string;
  accessorFn?: (row: TData) => TValue;
  header?: string | ((props: any) => React.ReactNode);
  cell?: (props: any) => React.ReactNode;
  enableSorting?: boolean;
  enableHiding?: boolean;
  size?: number;
  minSize?: number;
  maxSize?: number;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onExport?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyState?: React.ReactNode;
  toolbar?: React.ReactNode;
  rowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: TData[]) => void;
  expandable?: boolean;
  renderExpandedRow?: (row: TData) => React.ReactNode;
  stickyHeader?: boolean;
  stripedRows?: boolean;
  compactMode?: boolean;
}

export type { ColumnDef };

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  error = null,
  onRefresh,
  onExport,
  searchable = true,
  searchPlaceholder = 'Search...',
  filterable = true,
  pagination = true,
  pageSize = 10,
  className,
  emptyState,
  toolbar,
  rowSelection = false,
  onRowSelectionChange,
  expandable = false,
  renderExpandedRow,
  stickyHeader = false,
  stripedRows = true,
  compactMode = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelectionState, setRowSelectionState] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [showColumnVisibility, setShowColumnVisibility] = useState(false);

  // Add row selection column if needed
  const enhancedColumns = useMemo(() => {
    if (!rowSelection) return columns;

    const selectionColumn: ColumnDef<TData, TValue> = {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onChange={(checked) => table.toggleAllPageRowsSelected(!!checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onChange={(checked) => row.toggleSelected(!!checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };

    return [selectionColumn, ...columns];
  }, [columns, rowSelection]);

  const table = useReactTable({
    data,
    columns: enhancedColumns as any,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelectionState,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelectionState,
      globalFilter,
      pagination: pagination ? {
        pageIndex: 0,
        pageSize,
      } : undefined,
    },
    initialState: {
      pagination: pagination ? {
        pageSize,
      } : undefined,
    },
  });

  // Handle row selection change
  React.useEffect(() => {
    if (onRowSelectionChange && rowSelection) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onRowSelectionChange(selectedRows);
    }
  }, [rowSelectionState, onRowSelectionChange, rowSelection, table]);

  const handleExpandRow = (rowId: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {rowSelection && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Badge variant="secondary">
              {table.getFilteredSelectedRowModel().rows.length} selected
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {toolbar}
          
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          )}

          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}

          {filterable && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColumnVisibility(!showColumnVisibility)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Columns
              </Button>
              
              {showColumnVisibility && (
                <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
                  <div className="space-y-2">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => (
                        <label key={column.id} className="flex items-center space-x-2 text-sm">
                          <Checkbox
                            checked={column.getIsVisible()}
                            onChange={(checked) => column.toggleVisibility(!!checked)}
                          />
                          <span className="capitalize">{column.id}</span>
                        </label>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className={cn(
        'border rounded-lg overflow-hidden',
        stickyHeader && 'max-h-[600px] overflow-y-auto'
      )}>
        <table className="w-full">
          <thead className={cn(
            'bg-gray-50 border-b',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      header.column.getCanSort() && 'cursor-pointer hover:bg-gray-100',
                      compactMode && 'px-2 py-2'
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center space-x-1">
                      <span>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </span>
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {expandable && <th className="w-12"></th>}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <tr key={index}>
                  {enhancedColumns.map((_, colIndex) => (
                    <td key={colIndex} className="px-4 py-3">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  <tr
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      stripedRows && index % 2 === 0 && 'bg-gray-50/50',
                      row.getIsSelected() && 'bg-blue-50'
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          'px-4 py-3 text-sm text-gray-900',
                          compactMode && 'px-2 py-2'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    {expandable && (
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpandRow(row.id)}
                        >
                          {expandedRows[row.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    )}
                  </tr>
                  {expandable && expandedRows[row.id] && renderExpandedRow && (
                    <tr>
                      <td colSpan={enhancedColumns.length + 1} className="px-4 py-3 bg-gray-50">
                        {renderExpandedRow(row.original)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={enhancedColumns.length + (expandable ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyState || (
                    <div className="flex flex-col items-center">
                      <div className="text-gray-400 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                      <p className="text-gray-500">
                        {globalFilter ? 'No results match your search criteria.' : 'No data available to display.'}
                      </p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <span>
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} entries
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="flex items-center space-x-1 text-sm">
              <span>Page</span>
              <strong>
                {table.getState().pagination.pageIndex + 1} of{' '}
                {table.getPageCount()}
              </strong>
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}