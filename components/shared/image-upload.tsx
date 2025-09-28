"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, X, Star, ImageIcon, AlertCircle, Loader2, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onSelectFiles: (files: File[]) => void
  onRemove: (index: number) => void
  onSetPrimary?: (index: number) => void
  value: (File | string)[]
  primaryIndex?: number
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  showPreview?: boolean
  showLocalPreview?: boolean
  disabled?: boolean
  className?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onSelectFiles,
  onRemove,
  onSetPrimary,
  value = [],
  primaryIndex = 0,
  multiple = true,
  maxFiles = 10,
  maxSize = 5, // 5MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  showPreview = true,
  showLocalPreview = true,
  disabled = false,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(", ")}`
      }

      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`
      }

      return null
    },
    [acceptedTypes, maxSize],
  )

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || disabled) return

      setIsLoading(true)
      const validFiles: File[] = []
      const errors: string[] = []

      // Check total file limit
      if (!multiple && files.length > 1) {
        errors.push("Only one file is allowed")
        setIsLoading(false)
        toast.error(errors[0])
        return
      }

      if (value.length + files.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`)
        setIsLoading(false)
        toast.error(errors[0])
        return
      }

      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const error = validateFile(file)

        if (error) {
          errors.push(`${file.name}: ${error}`)
        } else {
          validFiles.push(file)
        }
      }

      // Show errors if any
      if (errors.length > 0) {
        errors.forEach((error) => toast.error(error))
      }

      // Add valid files
      if (validFiles.length > 0) {
        onSelectFiles(validFiles)
        toast.success(`${validFiles.length} file${validFiles.length > 1 ? "s" : ""} added successfully`)
      }

      setIsLoading(false)
    },
    [disabled, multiple, maxFiles, value.length, validateFile, onSelectFiles],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragging(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      handleFileSelect(files)
    },
    [disabled, handleFileSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [handleFileSelect],
  )

  const getImageUrl = useCallback((item: File | string): string => {
    if (typeof item === "string") {
      return item
    }
    return URL.createObjectURL(item)
  }, [])

  const getFileName = useCallback((item: File | string): string => {
    if (typeof item === "string") {
      return item.split("/").pop() || "Image"
    }
    return item.name
  }, [])

  const handleRemove = useCallback(
    (index: number) => {
      if (disabled) return
      onRemove(index)
      toast.success("Image removed")
    },
    [disabled, onRemove],
  )

  const handleSetPrimary = useCallback(
    (index: number) => {
      if (disabled || !onSetPrimary) return
      onSetPrimary(index)
      toast.success("Primary image updated")
    },
    [disabled, onSetPrimary],
  )

  const openFileDialog = useCallback(() => {
    if (disabled || !fileInputRef.current) return
    fileInputRef.current.click()
  }, [disabled])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragging && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-muted/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          ) : (
            <Upload
              className={cn("h-8 w-8 mb-4", isDragging && !disabled ? "text-primary" : "text-muted-foreground")}
            />
          )}

          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              {isLoading ? "Processing files..." : "Drop images here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground">
              {multiple ? `Up to ${maxFiles} files` : "Single file only"} • Max {maxSize}MB each •
              {acceptedTypes
                .map((type) => type.split("/")[1])
                .join(", ")
                .toUpperCase()}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(",")}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Image Preview Grid */}
      {showPreview && value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((item, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                {showLocalPreview ? (
                  <img
                    src={getImageUrl(item) || "/placeholder.svg"}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=200&width=200&text=Error"
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                {/* Primary Badge */}
                {onSetPrimary && index === primaryIndex && (
                  <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground" variant="default">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Primary
                  </Badge>
                )}

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  {onSetPrimary && index !== primaryIndex && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetPrimary(index)
                      }}
                      disabled={disabled}
                      className="h-8 w-8 p-0"
                      type="button" // Fix: Add type button
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}

                  {showLocalPreview && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(getImageUrl(item), "_blank")
                      }}
                      className="h-8 w-8 p-0"
                      type="button" // Fix: Add type button
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemove(index)
                    }}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                    type="button" // Fix: Add type button
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* File List (Alternative to Preview) */}
      {!showPreview && value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({value.length})</h4>
          <div className="space-y-2">
            {value.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <ImageIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate" title={getFileName(item)}>
                    {getFileName(item)}
                  </span>
                  {onSetPrimary && index === primaryIndex && (
                    <Badge variant="outline" className="ml-2">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Primary
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {onSetPrimary && index !== primaryIndex && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetPrimary(index)}
                      disabled={disabled}
                      className="h-8 w-8 p-0"
                      type="button" // Fix: Add type button
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    type="button" // Fix: Add type button
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Stats */}
      {value.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {value.length} of {maxFiles} files
          </span>
          {multiple && value.length < maxFiles && (
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={disabled}
              className="h-7 bg-transparent"
              type="button" // Fix: Add type button
            >
              <Upload className="h-3 w-3 mr-1" />
              Add More
            </Button>
          )}
        </div>
      )}

      {/* Error State */}
      {value.length === 0 && !isLoading && (
        <div className="text-center py-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No images uploaded yet</p>
        </div>
      )}
    </div>
  )
}

export default ImageUpload