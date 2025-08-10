"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Command,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

interface CommandItem {
  id: string
  title: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: string
  keywords: string[]
  shortcut?: string
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-dashboard",
        title: "Go to Dashboard",
        description: "View dashboard overview",
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => router.push("/"),
        category: "Navigation",
        keywords: ["dashboard", "home", "overview"],
      },
      {
        id: "nav-products",
        title: "Go to Products",
        description: "Manage your products",
        icon: <Package className="h-4 w-4" />,
        action: () => router.push("/products"),
        category: "Navigation",
        keywords: ["products", "inventory", "catalog"],
      },
      {
        id: "nav-orders",
        title: "Go to Orders",
        description: "View and manage orders",
        icon: <ShoppingCart className="h-4 w-4" />,
        action: () => router.push("/orders"),
        category: "Navigation",
        keywords: ["orders", "sales", "transactions"],
      },
      {
        id: "nav-customers",
        title: "Go to Customers",
        description: "Manage customer accounts",
        icon: <Users className="h-4 w-4" />,
        action: () => router.push("/customers"),
        category: "Navigation",
        keywords: ["customers", "users", "accounts"],
      },
      {
        id: "nav-analytics",
        title: "Go to Analytics",
        description: "View detailed analytics",
        icon: <BarChart3 className="h-4 w-4" />,
        action: () => router.push("/analytics"),
        category: "Navigation",
        keywords: ["analytics", "reports", "insights", "data"],
      },
      {
        id: "nav-settings",
        title: "Go to Settings",
        description: "Configure your store",
        icon: <Settings className="h-4 w-4" />,
        action: () => router.push("/settings"),
        category: "Navigation",
        keywords: ["settings", "configuration", "preferences"],
      },

      // Actions
      {
        id: "action-add-product",
        title: "Add New Product",
        description: "Create a new product",
        icon: <Plus className="h-4 w-4" />,
        action: () => router.push("/products/add"),
        category: "Actions",
        keywords: ["add", "create", "new", "product"],
        shortcut: "Ctrl+N",
      },
      {
        id: "action-export-data",
        title: "Export Data",
        description: "Export analytics data",
        icon: <Download className="h-4 w-4" />,
        action: () => console.log("Export data"),
        category: "Actions",
        keywords: ["export", "download", "data", "csv", "excel"],
        shortcut: "Ctrl+E",
      },
      {
        id: "action-import-products",
        title: "Import Products",
        description: "Bulk import products",
        icon: <Upload className="h-4 w-4" />,
        action: () => router.push("/products/import"),
        category: "Actions",
        keywords: ["import", "upload", "bulk", "products"],
      },
      {
        id: "action-refresh",
        title: "Refresh Data",
        description: "Refresh all dashboard data",
        icon: <RefreshCw className="h-4 w-4" />,
        action: () => window.location.reload(),
        category: "Actions",
        keywords: ["refresh", "reload", "update"],
        shortcut: "Ctrl+R",
      },

      // Quick Views
      {
        id: "view-recent-orders",
        title: "View Recent Orders",
        description: "Show latest orders",
        icon: <Eye className="h-4 w-4" />,
        action: () => router.push("/orders?filter=recent"),
        category: "Quick Views",
        keywords: ["recent", "orders", "latest"],
      },
      {
        id: "view-low-stock",
        title: "View Low Stock Items",
        description: "Show products with low inventory",
        icon: <Package className="h-4 w-4" />,
        action: () => router.push("/products?filter=low-stock"),
        category: "Quick Views",
        keywords: ["low", "stock", "inventory", "alert"],
      },
    ],
    [router],
  )

  const filteredCommands = useMemo(() => {
    if (!query) return commands

    return commands.filter((command) => {
      const searchText = query.toLowerCase()
      return (
        command.title.toLowerCase().includes(searchText) ||
        command.description?.toLowerCase().includes(searchText) ||
        command.keywords.some((keyword) => keyword.toLowerCase().includes(searchText))
      )
    })
  }, [commands, query])

  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {}
    filteredCommands.forEach((command) => {
      if (!groups[command.category]) {
        groups[command.category] = []
      }
      groups[command.category].push(command)
    })
    return groups
  }, [filteredCommands])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
        onOpenChange(false)
        setQuery("")
        setSelectedIndex(0)
      }
    } else if (e.key === "Escape") {
      onOpenChange(false)
      setQuery("")
      setSelectedIndex(0)
    }
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl" showCloseButton={false}>
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <Input
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            autoFocus
          />
          <Badge variant="outline" className="ml-auto text-xs">
            <Command className="h-3 w-3 mr-1" />
            ESC
          </Badge>
        </div>

        <ScrollArea className="max-h-96">
          <div className="p-2">
            <AnimatePresence>
              {Object.entries(groupedCommands).map(([category, items], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: categoryIndex * 0.05 }}
                >
                  {categoryIndex > 0 && <Separator className="my-2" />}
                  <div className="px-2 py-1">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{category}</h4>
                  </div>
                  {items.map((command, itemIndex) => {
                    const globalIndex = filteredCommands.indexOf(command)
                    const isSelected = globalIndex === selectedIndex

                    return (
                      <motion.div
                        key={command.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (categoryIndex * items.length + itemIndex) * 0.02 }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors ${
                          isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                        }`}
                        onClick={() => {
                          command.action()
                          onOpenChange(false)
                          setQuery("")
                          setSelectedIndex(0)
                        }}
                      >
                        <div className="flex-shrink-0">{command.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{command.title}</div>
                          {command.description && (
                            <div className="text-xs text-muted-foreground truncate">{command.description}</div>
                          )}
                        </div>
                        {command.shortcut && (
                          <Badge variant="outline" className="text-xs">
                            {command.shortcut}
                          </Badge>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredCommands.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No commands found for "{query}"</p>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Use ↑↓ to navigate, Enter to select, ESC to close
        </div>
      </DialogContent>
    </Dialog>
  )
}
