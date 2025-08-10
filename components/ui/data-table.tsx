"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Download,
  Trash2,
  Edit,
  Eye,
} from "lucide-react"
import { AdvancedSearch } from "./advanced-search"

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: "left" | "center" | "right"
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  searchFilters?: Array<{
    key: string
    label: string
    type: "text" | "select" | "date" | "number"
    options?: Array<{ value: string; label: string }>
  }>
  selectable?: boolean
  pagination?: boolean
  pageSize?: number
  onRowClick?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  bulkActions?: Array<{
    label: string
    icon?: React.ReactNode
    action: (selectedRows: T[]) => void
    variant?: "default" | "destructive"
  }>
  emptyState?: {
    icon?: React.ReactNode
    title: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchFilters = [],
  selectable = false,
  pagination = true,
  pageSize = 25,
  onRowClick,
  onSelectionChange,
  bulkActions = [],
  emptyState,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFiltersState, setSearchFiltersState] = useState<Record<string, any>>({})
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        }),
      )
    }

    // Apply search filters
    Object.entries(searchFiltersState).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter((row) => {
          const rowValue = row[key]
          if (typeof value === "string" && typeof rowValue === "string") {
            return rowValue.toLowerCase().includes(value.toLowerCase())
          }
          return rowValue === value
        })
      }
    })

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!]
        const bValue = b[sortConfig.key!]

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }

    return filtered
  }, [data, searchQuery, searchFiltersState, sortConfig, columns])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)
  const paginatedData = pagination
    ? filteredAndSortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredAndSortedData

  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedData)
      onSelectionChange?.(paginatedData)
    } else {
      setSelectedRows([])
      onSelectionChange?.([])
    }
  }

  const handleSelectRow = (row: T, checked: boolean) => {
    let newSelection: T[]
    if (checked) {
      newSelection = [...selectedRows, row]
    } else {
      newSelection = selectedRows.filter((selectedRow) => selectedRow !== row)
    }
    setSelectedRows(newSelection)
    onSelectionChange?.(newSelection)
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const renderCell = (column: Column<T>, row: T) => {
    const value = row[column.key]

    if (column.render) {
      return column.render(value, row)
    }

    // Default rendering based on value type
    if (typeof value === "boolean") {
      return <Badge variant={value ? "default" : "secondary"}>{value ? "Yes" : "No"}</Badge>
    }

    if (value instanceof Date) {
      return value.toLocaleDateString()
    }

    if (typeof value === "number" && column.key.toString().includes("price")) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value)
    }

    return value?.toString() || "-"
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {searchable && <Skeleton className="h-10 w-full max-w-sm" />}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                {columns.map((column) => (
                  <TableHead key={column.key.toString()}>
                    <Skeleton className="h-4 w-24" />
                  </TableHead>
                ))}
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-4 w-4" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key.toString()}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search */}
      {searchable && (
        <AdvancedSearch
          placeholder={searchPlaceholder}
          filters={searchFilters}
          onSearch={(query, filters) => {
            setSearchQuery(query)
            setSearchFiltersState(filters)
            setCurrentPage(1)
          }}
        />
      )}

      {/* Bulk Actions */}
      {selectable && selectedRows.length > 0 && bulkActions.length > 0 && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} row{selectedRows.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center space-x-2">
            {bulkActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => action.action(selectedRows)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={`${column.width || ""} ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}`}
                >
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.label}
                      {getSortIcon(column.key)}
                    </Button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + 1} className="text-center py-8">
                  {emptyState ? (
                    <div className="flex flex-col items-center space-y-2">
                      {emptyState.icon}
                      <h3 className="font-medium">{emptyState.title}</h3>
                      {emptyState.description && (
                        <p className="text-sm text-muted-foreground">{emptyState.description}</p>
                      )}
                      {emptyState.action && (
                        <Button onClick={emptyState.action.onClick}>{emptyState.action.label}</Button>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">No data available</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.includes(row)}
                        onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell
                      key={column.key.toString()}
                      className={
                        column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""
                      }
                    >
                      {renderCell(column, row)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of {filteredAndSortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
