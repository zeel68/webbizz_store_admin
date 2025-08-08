"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { Upload, Trash2, Star } from "lucide-react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  disabled?: boolean
  onSelectFiles: (files: File[]) => void
  onRemove?: (index: number) => void
  onSetPrimary?: (index: number) => void
  value?: (File | string)[]
  primaryIndex?: number
  type?: "standard" | "profile" | "cover"
  showPreview?: boolean
  multiple?: boolean
  showLocalPreview: boolean
}

export default function ImageUpload({
  disabled = false,
  onSelectFiles,
  onRemove,
  onSetPrimary,
  value = [],
  primaryIndex = 0,
  type = "standard",
  showPreview = true,
  multiple = true,
  showLocalPreview = false
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    // Generate preview URLs
    const newPreviews: string[] = []
    const fileUrls: string[] = []

    value.forEach((item) => {
      if (typeof item === "string") {
        newPreviews.push(item) // remote URL
      } else if (showLocalPreview && item instanceof File) {
        const url = URL.createObjectURL(item)
        newPreviews.push(url)
        fileUrls.push(url) // track for cleanup
      }
    })

    setPreviews(newPreviews)

    // Cleanup object URLs
    return () => {
      fileUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [value, showLocalPreview])

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || disabled) return
      const files = Array.from(e.target.files)
      onSelectFiles(files)
      e.target.value = ""
    },
    [disabled, onSelectFiles],
  )

  const handleRemove = useCallback(
    (index: number) => {
      onRemove?.(index)
    },
    [onRemove],
  )

  const handleSetPrimary = useCallback(
    (index: number) => {
      onSetPrimary?.(index)
    },
    [onSetPrimary],
  )

  const renderPreview = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {previews.map((src, idx) => (
        <div key={idx} className="relative group">
          <img
            src={src || "/placeholder.svg"}
            alt={`Preview ₹{idx + 1}`}
            className={cn(
              "w-full h-24 object-cover rounded-md border-2 transition-all",
              primaryIndex === idx ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200",
            )}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
            {multiple && onSetPrimary && (
              <Button
                type="button"
                variant={primaryIndex === idx ? "default" : "secondary"}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleSetPrimary(idx)}
                disabled={disabled}
                title={primaryIndex === idx ? "Primary image" : "Set as primary"}
              >
                <Star className={cn("h-3 w-3", primaryIndex === idx && "fill-current")} />
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleRemove(idx)}
              disabled={disabled}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          {primaryIndex === idx && multiple && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full">
              Primary
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-4">
      {type === "profile" && <Label>Profile Image</Label>}
      {type === "cover" && <Label>Cover Image</Label>}
      {type === "standard" && <Label>Images</Label>}

      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-4 transition-colors",
          disabled
            ? "bg-muted/50 border-muted-foreground/25 cursor-not-allowed"
            : "bg-background border-muted-foreground/50 hover:border-primary/50 cursor-pointer",
        )}
      >
        <div className="text-center space-y-3">
          <Upload
            className={cn("h-8 w-8 mx-auto", disabled ? "text-muted-foreground/25" : "text-muted-foreground/50")}
          />
          <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
          <Input
            type="file"
            multiple={multiple}
            accept="image/*"
            onChange={handleImageChange}
            className="mt-2 max-w-xs mx-auto"
            disabled={disabled}
          />
        </div>
      </div>

      {showPreview && previews.length > 0 && (
        <div className="space-y-2">
          <Label>Preview</Label>
          {renderPreview()}
        </div>
      )}
    </div>
  )
}
