"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Search, Filter, X, CalendarIcon, Tag, DollarSign, Package } from "lucide-react"
import { debounce } from "@/lib/utils"

interface SearchFilter {
  key: string
  label: string
  type: "text" | "select" | "date" | "number" | "boolean"
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface AdvancedSearchProps {
  placeholder?: string
  filters?: SearchFilter[]
  onSearch: (query: string, filters: Record<string, any>) => void
  className?: string
}

export function AdvancedSearch({ placeholder = "Search...", filters = [], onSearch, className }: AdvancedSearchProps) {
  const [query, setQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = debounce((searchQuery: string, searchFilters: Record<string, any>) => {
    onSearch(searchQuery, searchFilters)
  }, 300)

  useEffect(() => {
    debouncedSearch(query, activeFilters)
  }, [query, activeFilters])

  const handleFilterChange = (key: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const removeFilter = (key: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const clearAllFilters = () => {
    setActiveFilters({})
    setQuery("")
  }

  const getFilterIcon = (type: string) => {
    switch (type) {
      case "select":
        return <Tag className="h-3 w-3" />
      case "date":
        return <CalendarIcon className="h-3 w-3" />
      case "number":
        return <DollarSign className="h-3 w-3" />
      default:
        return <Package className="h-3 w-3" />
    }
  }

  const renderFilterInput = (filter: SearchFilter) => {
    const value = activeFilters[filter.key] || ""

    switch (filter.type) {
      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleFilterChange(filter.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start text-left font-normal bg-transparent">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? new Date(value).toLocaleDateString() : filter.placeholder || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleFilterChange(filter.key, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case "number":
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        )

      default:
        return (
          <Input
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        )
    }
  }

  const activeFilterCount = Object.keys(activeFilters).length

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={searchInputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-20"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
          {filters.length > 0 && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <Filter className="h-3 w-3 mr-1" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear all
                      </Button>
                    )}
                  </div>
                  <Separator />
                  {filters.map((filter) => (
                    <div key={filter.key} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getFilterIcon(filter.type)}
                        <label className="text-sm font-medium">{filter.label}</label>
                      </div>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find((f) => f.key === key)
            if (!filter || !value) return null

            let displayValue = value
            if (filter.type === "select") {
              const option = filter.options?.find((opt) => opt.value === value)
              displayValue = option?.label || value
            } else if (filter.type === "date") {
              displayValue = new Date(value).toLocaleDateString()
            }

            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {getFilterIcon(filter.type)}
                <span className="text-xs">
                  {filter.label}: {displayValue}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-3 w-3 p-0 hover:bg-transparent"
                  onClick={() => removeFilter(key)}
                >
                  <X className="h-2 w-2" />
                </Button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
