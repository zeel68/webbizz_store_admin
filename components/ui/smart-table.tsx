"use client"

import type React from "react"

import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Filter,
  Columns,
  Download,
  RefreshCw,
  Search,
  X,
  Eye,
} from "lucide-react"
import { FixedSizeList as List } from "react-window"

interface Column<T> {
  key: keyof T
  label: string
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  render?: (value: any, row: T, index: number) => React.ReactNode
  align?: "left" | "center" | "right"
  sticky?: boolean
  hidden?: boolean
}

interface SmartTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  virtualScrolling?: boolean
  rowHeight?: number
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  selectable?: boolean
  resizable?: boolean
  pagination?: boolean
  pageSize?: number
  stickyHeader?: boolean
  onRowClick?: (row: T, index: number) => void
  onSelectionChange?: (selectedRows: T[]) => void
  onSort?: (key: keyof T, direction: "asc" | "desc") => void
  onFilter?: (filters: Record<string, any>) => void
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

export function SmartTable<T extends Record<string, any>>({
  data,
  columns: initialColumns,
  loading = false,
  virtualScrolling = false,
  rowHeight = 60,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  resizable = false,
  pagination = true,
  pageSize = 25,
  stickyHeader = true,
  onRowClick,
  onSelectionChange,
  onSort,
  onFilter,
  bulkActions = [],
  emptyState,
  className,
}: SmartTableProps<T>) {
  const [columns, setColumns] = useState(initialColumns)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })
  const [selectedRows, setSelectedRows] = useState<T[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [isResizing, setIsResizing] = useState<string | null>(null)

  const tableRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ startX: number; startWidth: number; column: string } | null>(null)

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter((row) =>
        columns.some((column) => {
          if (column.hidden) return false
          const value = row[column.key]
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        }),
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        filtered = filtered.filter((row) => {
          const rowValue = row[key]
          if (Array.isArray(value)) {
            return value.includes(rowValue)
          }
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
  }, [data, searchQuery, filters, sortConfig, columns])

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize)
  const paginatedData = pagination
    ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : processedData

  const visibleColumns = columns.filter((col) => !col.hidden)

  const handleSort = useCallback(
    (key: keyof T) => {
      const newDirection = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
      setSortConfig({ key, direction: newDirection })
      onSort?.(key, newDirection)
    },
    [sortConfig, onSort],
  )

  const handleFilter = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFilter?.(newFilters)
      setCurrentPage(1)
    },
    [filters, onFilter],
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const newSelection = checked ? paginatedData : []
      setSelectedRows(newSelection)
      onSelectionChange?.(newSelection)
    },
    [paginatedData, onSelectionChange],
  )

  const handleSelectRow = useCallback(
    (row: T, checked: boolean) => {
      let newSelection: T[]
      if (checked) {
        newSelection = [...selectedRows, row]
      } else {
        newSelection = selectedRows.filter((selectedRow) => selectedRow !== row)
      }
      setSelectedRows(newSelection)
      onSelectionChange?.(newSelection)
    },
    [selectedRows, onSelectionChange],
  )

  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setColumns((prev) => prev.map((col) => (col.key === columnKey ? { ...col, hidden: !col.hidden } : col)))
  }, [])

  // Column resizing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnKey: string) => {
      if (!resizable) return

      e.preventDefault()
      setIsResizing(columnKey)

      const startX = e.clientX
      const startWidth = columnWidths[columnKey] || 150

      resizeRef.current = { startX, startWidth, column: columnKey }
    },
    [resizable, columnWidths],
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeRef.current || !isResizing) return

      const { startX, startWidth, column } = resizeRef.current
      const diff = e.clientX - startX
      const newWidth = Math.max(100, startWidth + diff)

      setColumnWidths((prev) => ({ ...prev, [column]: newWidth }))
    },
    [isResizing],
  )

  const handleMouseUp = useCallback(() => {
    setIsResizing(null)
    resizeRef.current = null
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />
    }
    return sortConfig.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = row[column.key]

    if (column.render) {
      return column.render(value, row, index)
    }

    // Default rendering
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

  // Virtual row renderer
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = paginatedData[index]
    const isSelected = selectedRows.includes(row)

    return (
      <div style={style}>
        <TableRow
          className={`cursor-pointer hover:bg-muted/50 ${isSelected ? "bg-muted" : ""}`}
          onClick={() => onRowClick?.(row, index)}
        >
          {selectable && (
            <TableCell className="w-12">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
            </TableCell>
          )}
          {visibleColumns.map((column) => (
            <TableCell
              key={column.key.toString()}
              className={column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}
              style={{ width: columnWidths[column.key.toString()] || column.width }}
            >
              {renderCell(column, row, index)}
            </TableCell>
          ))}
          <TableCell className="w-12">
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
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Loading skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Skeleton className="h-4 w-4" />
                  </TableHead>
                )}
                {visibleColumns.map((column) => (
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
                  {visibleColumns.map((column) => (
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
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          {/* Search */}
          {searchable && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {/* Filters */}
          {filterable && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(filters).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filter Options</h4>
                  {columns
                    .filter((col) => col.filterable && !col.hidden)
                    .map((column) => (
                      <div key={column.key.toString()} className="space-y-2">
                        <label className="text-sm font-medium">{column.label}</label>
                        <Input
                          placeholder={`Filter by ${column.label.toLowerCase()}`}
                          value={filters[column.key.toString()] || ""}
                          onChange={(e) => handleFilter(column.key.toString(), e.target.value)}
                        />
                      </div>
                    ))}
                  {Object.keys(filters).length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilters({})
                        onFilter?.({})
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key.toString()}
                  checked={!column.hidden}
                  onCheckedChange={() => toggleColumnVisibility(column.key.toString())}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Refresh */}
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectable && selectedRows.length > 0 && bulkActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2"
        >
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
        </motion.div>
      )}

      {/* Table */}
      <div className="rounded-md border" ref={tableRef}>
        <Table>
          <TableHeader className={stickyHeader ? "sticky top-0 bg-background z-10" : ""}>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {visibleColumns.map((column) => (
                <TableHead
                  key={column.key.toString()}
                  className={`relative ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}`}
                  style={{
                    width: columnWidths[column.key.toString()] || column.width,
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                  }}
                >
                  <div className="flex items-center gap-2">
                    {sortable && column.sortable ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 font-medium hover:bg-transparent"
                        onClick={() => handleSort(column.key)}
                      >
                        {column.label}
                        {getSortIcon(column.key)}
                      </Button>
                    ) : (
                      <span className="font-medium">{column.label}</span>
                    )}
                  </div>

                  {/* Resize Handle */}
                  {resizable && column.resizable !== false && (
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
                      onMouseDown={(e) => handleMouseDown(e, column.key.toString())}
                    />
                  )}
                </TableHead>
              ))}
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0) + 1} className="text-center py-8">
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
            ) : virtualScrolling ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + (selectable ? 1 : 0) + 1} className="p-0">
                  <List
                    height={Math.min(paginatedData.length * rowHeight, 400)}
                    itemCount={paginatedData.length}
                    itemSize={rowHeight}
                  >
                    {Row}
                  </List>
                </TableCell>
              </TableRow>
            ) : (
              <AnimatePresence>
                {paginatedData.map((row, index) => {
                  const isSelected = selectedRows.includes(row)
                  return (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.02 }}
                      className={`cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? "bg-muted" : ""}`}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {selectable && (
                        <TableCell className="w-12">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectRow(row, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </TableCell>
                      )}
                      {visibleColumns.map((column) => (
                        <TableCell
                          key={column.key.toString()}
                          className={
                            column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""
                          }
                          style={{ width: columnWidths[column.key.toString()] || column.width }}
                        >
                          {renderCell(column, row, index)}
                        </TableCell>
                      ))}
                      <TableCell className="w-12">
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, processedData.length)} of{" "}
            {processedData.length} results
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
