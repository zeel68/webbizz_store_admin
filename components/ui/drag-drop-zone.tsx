"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, File, ImageIcon, FileText, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"

interface FileWithPreview extends File {
  preview?: string
  id: string
  progress?: number
  error?: string
}

interface DragDropZoneProps {
  onFilesSelected: (files: FileWithPreview[]) => void
  onFileRemove?: (fileId: string) => void
  onUpload?: (files: FileWithPreview[]) => Promise<void>
  accept?: string
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  className?: string
}

export function DragDropZone({
  onFilesSelected,
  onFileRemove,
  onUpload,
  accept = "image/*",
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  disabled = false,
  className,
}: DragDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`
    }

    if (
      accept &&
      !accept.split(",").some((type) => {
        const cleanType = type.trim()
        if (cleanType.endsWith("/*")) {
          return file.type.startsWith(cleanType.slice(0, -1))
        }
        return file.type === cleanType
      })
    ) {
      return "File type not supported"
    }

    return null
  }

  const processFiles = useCallback(
    (fileList: FileList) => {
      const newFiles: FileWithPreview[] = []
      const errors: string[] = []

      Array.from(fileList).forEach((file, index) => {
        if (files.length + newFiles.length >= maxFiles) {
          errors.push(`Maximum ${maxFiles} files allowed`)
          return
        }

        const error = validateFile(file)
        const fileWithPreview: FileWithPreview = {
          ...file,
          id: `${Date.now()}-${index}`,
          error,
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          fileWithPreview.preview = URL.createObjectURL(file)
        }

        newFiles.push(fileWithPreview)
      })

      if (errors.length > 0) {
        toast({
          title: "Upload Error",
          description: errors[0],
          variant: "destructive",
        })
      }

      if (newFiles.length > 0) {
        const updatedFiles = [...files, ...newFiles]
        setFiles(updatedFiles)
        onFilesSelected(updatedFiles)
      }
    },
    [files, maxFiles, onFilesSelected, toast],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled) return

      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        processFiles(droppedFiles)
      }
    },
    [disabled, processFiles],
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        processFiles(selectedFiles)
      }
      // Reset input value to allow selecting the same file again
      e.target.value = ""
    },
    [processFiles],
  )

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const file = prev.find((f) => f.id === fileId)
        if (file?.preview) {
          URL.revokeObjectURL(file.preview)
        }
        const updated = prev.filter((f) => f.id !== fileId)
        onFilesSelected(updated)
        onFileRemove?.(fileId)
        return updated
      })
    },
    [onFilesSelected, onFileRemove],
  )

  const handleUpload = async () => {
    if (!onUpload || files.length === 0) return

    setUploading(true)
    try {
      await onUpload(files)
      toast({
        title: "Upload Successful",
        description: `${files.length} file(s) uploaded successfully`,
      })
      setFiles([])
      onFilesSelected([])
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (file.type.includes("text")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : disabled
              ? "border-muted bg-muted/20"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
            <Upload className={`h-6 w-6 ${isDragOver ? "text-primary" : "text-muted-foreground"}`} />
          </div>

          <div>
            <p className="text-lg font-medium">{isDragOver ? "Drop files here" : "Drag & drop files here"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              or{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-medium"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                browse files
              </Button>
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              Maximum {maxFiles} files, up to {(maxSize / 1024 / 1024).toFixed(1)}MB each
            </p>
            <p>
              Supported formats:{" "}
              {accept
                .split(",")
                .map((type) => type.trim())
                .join(", ")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Selected Files ({files.length})</h4>
              {onUpload && (
                <Button onClick={handleUpload} disabled={uploading || files.some((f) => f.error)} size="sm">
                  {uploading ? "Uploading..." : "Upload All"}
                </Button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    file.error ? "border-destructive bg-destructive/5" : "border-border bg-muted/20"
                  }`}
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {file.preview ? (
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(file)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                      {file.error && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    {file.error && <p className="text-xs text-destructive mt-1">{file.error}</p>}
                    {file.progress !== undefined && <Progress value={file.progress} className="mt-2 h-1" />}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
</merged_code>
