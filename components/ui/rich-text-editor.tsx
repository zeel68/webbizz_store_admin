"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Image, Code, Type, Palette, X, Check, Undo, Redo, Quote } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  minHeight?: number
  maxHeight?: number
}

// Color palette presets
const colorPresets = [
  '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#EC4899'
]

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start typing...",
  label,
  className,
  disabled = false,
  minHeight = 200,
  maxHeight
}: RichTextEditorProps) {
  const [isActive, setIsActive] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    orderedList: false,
    unorderedList: false
  })
  const editorRef = useRef<HTMLDivElement>(null)
  const isUpdatingRef = useRef(false)
  const lastContentRef = useRef("")
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showPlaceholder, setShowPlaceholder] = useState(true)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [currentFormat, setCurrentFormat] = useState("p")
  const [currentColor, setCurrentColor] = useState("#000000")
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Track undo/redo state
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // Improved debounced content change handler
  const debouncedOnChange = useCallback((content: string) => {
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current)
    }

    changeTimeoutRef.current = setTimeout(() => {
      if (onChange && content !== lastContentRef.current) {
        lastContentRef.current = content
        onChange(content)
      }
    }, 100) // Reduced debounce time for better responsiveness
  }, [onChange])

  // Helper function to get all text nodes
  const getTextNodes = useCallback((node: Node): Text[] => {
    const textNodes: Text[] = []

    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node as Text)
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        textNodes.push(...getTextNodes(node.childNodes[i]))
      }
    }

    return textNodes
  }, [])

  // Initialize editor content with better synchronization
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentContent = editorRef.current.innerHTML

      if (value !== currentContent) {
        isUpdatingRef.current = true

        // Store current selection
        const selection = window.getSelection()
        let range = null
        let startOffset = 0
        let endOffset = 0

        if (selection && selection.rangeCount > 0 && document.activeElement === editorRef.current) {
          range = selection.getRangeAt(0)
          startOffset = range.startOffset
          endOffset = range.endOffset
        }

        if (value) {
          editorRef.current.innerHTML = value
          setShowPlaceholder(false)
        } else {
          editorRef.current.innerHTML = ""
          setShowPlaceholder(true)
        }

        // Restore selection if editor was focused
        if (range && document.activeElement === editorRef.current) {
          try {
            const newRange = document.createRange()
            const textNodes = getTextNodes(editorRef.current)
            let currentOffset = 0

            for (const node of textNodes) {
              const nodeLength = node.textContent?.length || 0
              if (currentOffset + nodeLength >= startOffset) {
                newRange.setStart(node, Math.max(0, startOffset - currentOffset))
                newRange.setEnd(node, Math.min(nodeLength, endOffset - currentOffset))
                break
              }
              currentOffset += nodeLength
            }

            selection?.removeAllRanges()
            selection?.addRange(newRange)
          } catch (error) {
            // Fallback: place cursor at end
            const newRange = document.createRange()
            newRange.selectNodeContents(editorRef.current)
            newRange.collapse(false)
            selection?.removeAllRanges()
            selection?.addRange(newRange)
          }
        }

        setTimeout(() => {
          isUpdatingRef.current = false
        }, 10)
      }
    }
  }, [value, getTextNodes])

  const handleCommand = useCallback((command: string, value?: string) => {
    if (!editorRef.current || disabled || isUpdatingRef.current) return

    try {
      document.execCommand(command, false, value)
      editorRef.current.focus()

      // Immediate updates for better responsiveness
      requestAnimationFrame(() => {
        updateActiveStates()
        handleContentChange()
        updateUndoRedoState()
      })
    } catch (error) {
      console.warn('Command execution failed:', error)
    }
  }, [disabled])

  const updateActiveStates = useCallback(() => {
    if (!editorRef.current || disabled || isUpdatingRef.current) return

    try {
      setIsActive({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        alignLeft: document.queryCommandState('justifyLeft') ||
          (!document.queryCommandState('justifyCenter') && !document.queryCommandState('justifyRight')),
        alignCenter: document.queryCommandState('justifyCenter'),
        alignRight: document.queryCommandState('justifyRight'),
        orderedList: document.queryCommandState('insertOrderedList'),
        unorderedList: document.queryCommandState('insertUnorderedList')
      })

      // Update current format
      const selection = window.getSelection()
      if (selection && selection.anchorNode) {
        let node = selection.anchorNode.nodeType === Node.TEXT_NODE
          ? selection.anchorNode.parentElement
          : selection.anchorNode as HTMLElement

        const blockTags = ["H1", "H2", "H3", "H4", "H5", "H6", "P", "DIV", "BLOCKQUOTE", "PRE"]

        while (node && !blockTags.includes(node.nodeName) && node !== editorRef.current) {
          node = node.parentElement
        }

        if (node && node !== editorRef.current) {
          setCurrentFormat(node.nodeName.toLowerCase())
        } else {
          setCurrentFormat("p")
        }
      }
    } catch (error) {
      console.warn('Error updating active states:', error)
    }
  }, [disabled])

  const updateUndoRedoState = useCallback(() => {
    if (isUpdatingRef.current) return

    try {
      setCanUndo(document.queryCommandEnabled('undo'))
      setCanRedo(document.queryCommandEnabled('redo'))
    } catch (error) {
      console.warn('Error updating undo/redo state:', error)
    }
  }, [])

  const handleContentChange = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return

    const content = editorRef.current.innerHTML
    const isEmpty = content === "<br>" || content === "" || content === "<div><br></div>" || content.trim() === ""

    setShowPlaceholder(isEmpty && !isFocused)
    debouncedOnChange(content)
  }, [debouncedOnChange, isFocused])

  // Improved input handler for better fast typing support
  const handleInput = useCallback((e: React.FormEvent) => {
    if (isUpdatingRef.current) return

    handleContentChange()
  }, [handleContentChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z':
          if (e.shiftKey) {
            e.preventDefault()
            handleCommand('redo')
          } else {
            e.preventDefault()
            handleCommand('undo')
          }
          return
        case 'y':
          e.preventDefault()
          handleCommand('redo')
          return
        case 'b':
          e.preventDefault()
          handleCommand('bold')
          return
        case 'i':
          e.preventDefault()
          handleCommand('italic')
          return
        case 'u':
          e.preventDefault()
          handleCommand('underline')
          return
      }
    }
  }, [handleCommand])

  const handleKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (isUpdatingRef.current) return

    // Use requestAnimationFrame for smoother updates during fast typing
    requestAnimationFrame(() => {
      updateActiveStates()
      updateUndoRedoState()
    })
  }, [updateActiveStates, updateUndoRedoState])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()

    if (isUpdatingRef.current) return

    const text = e.clipboardData.getData('text/plain')

    // Insert text while preserving selection
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()

      const textNode = document.createTextNode(text)
      range.insertNode(textNode)
      range.setStartAfter(textNode)
      range.setEndAfter(textNode)
      selection.removeAllRanges()
      selection.addRange(range)
    }

    // Delay content change to allow DOM to update
    setTimeout(() => {
      handleContentChange()
    }, 0)
  }, [handleContentChange])

  const insertLink = useCallback(() => {
    if (!linkUrl) return

    const selection = window.getSelection()
    const selectedText = selection?.toString()

    if (selectedText) {
      handleCommand('createLink', linkUrl)
    } else if (linkText) {
      handleCommand('insertHTML', `<a href="${linkUrl}">${linkText}</a>`)
    } else {
      handleCommand('insertHTML', `<a href="${linkUrl}">${linkUrl}</a>`)
    }

    setLinkUrl("")
    setLinkText("")
    setLinkDialogOpen(false)
  }, [linkUrl, linkText, handleCommand])

  const insertImage = useCallback(() => {
    if (!imageUrl) return

    const img = `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`
    handleCommand('insertHTML', img)

    setImageUrl("")
    setImageAlt("")
    setImageDialogOpen(false)
  }, [imageUrl, imageAlt, handleCommand])

  const removeFormatting = useCallback(() => {
    handleCommand('removeFormat')
    handleCommand('unlink')
  }, [handleCommand])

  const handleEditorFocus = useCallback(() => {
    setIsFocused(true)

    if (editorRef.current?.innerHTML === "<br>") {
      isUpdatingRef.current = true
      editorRef.current.innerHTML = ""
      setTimeout(() => {
        isUpdatingRef.current = false
      }, 10)
    }

    setShowPlaceholder(false)

    // Delay active state updates to avoid conflicts
    setTimeout(() => {
      updateActiveStates()
    }, 50)
  }, [updateActiveStates])

  const handleEditorBlur = useCallback(() => {
    setIsFocused(false)

    setTimeout(() => {
      if (!editorRef.current) return

      const isEmpty = !editorRef.current.innerHTML ||
        editorRef.current.innerHTML === "<br>" ||
        editorRef.current.innerHTML === "<div><br></div>" ||
        editorRef.current.innerHTML.trim() === ""

      if (isEmpty) {
        setShowPlaceholder(true)
      }
    }, 100)
  }, [])

  const formatBlock = useCallback((tag: string) => {
    handleCommand('formatBlock', `<${tag}>`)
    setCurrentFormat(tag)
  }, [handleCommand])

  const applyColor = useCallback((color: string) => {
    handleCommand('foreColor', color)
    setCurrentColor(color)
    setColorPickerOpen(false)
  }, [handleCommand])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current)
      }
    }
  }, [])

  const blockOptions = [
    { value: "p", label: "Paragraph" },
    { value: "h1", label: "Heading 1" },
    { value: "h2", label: "Heading 2" },
    { value: "h3", label: "Heading 3" },
    { value: "h4", label: "Heading 4" },
    { value: "h5", label: "Heading 5" },
    { value: "h6", label: "Heading 6" },
    { value: "blockquote", label: "Quote" },
    { value: "pre", label: "Code Block" },
  ]

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <div className={cn(
        "border rounded-lg overflow-hidden transition-colors",
        isFocused && !disabled && "ring-2 ring-ring ring-offset-2",
        disabled && "opacity-60"
      )}>
        {/* Toolbar */}
        <div className="border-b bg-muted/30 p-2">
          <TooltipProvider delayDuration={300}>
            <div className="flex items-center gap-1 flex-wrap">
              {/* Format Dropdown */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <select
                    className="px-3 py-1.5 text-sm border rounded-md bg-background hover:bg-muted transition-colors min-w-[120px]"
                    value={currentFormat}
                    onChange={(e) => formatBlock(e.target.value)}
                    disabled={disabled}
                  >
                    {blockOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </TooltipTrigger>
                <TooltipContent>Text Format</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Undo/Redo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCommand('undo')}
                    disabled={disabled || !canUndo}
                    className="h-8 w-8 p-0"
                  >
                    <Undo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCommand('redo')}
                    disabled={disabled || !canRedo}
                    className="h-8 w-8 p-0"
                  >
                    <Redo className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Text Formatting */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.bold ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('bold')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold (Ctrl+B)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.italic ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('italic')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic (Ctrl+I)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.underline ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('underline')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Underline className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Underline (Ctrl+U)</TooltipContent>
              </Tooltip>

              {/* Color Picker */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled}
                        className="h-8 w-8 p-0 relative"
                      >
                        <Palette className="h-4 w-4" />
                        <div
                          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full"
                          style={{ backgroundColor: currentColor }}
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <div className="space-y-3">
                        <div className="text-sm font-medium">Colors</div>
                        <div className="grid grid-cols-6 gap-2">
                          {colorPresets.map((color) => (
                            <button
                              key={color}
                              className={cn(
                                "w-6 h-6 rounded-md border-2 transition-transform hover:scale-110",
                                currentColor === color ? "border-ring" : "border-muted"
                              )}
                              style={{ backgroundColor: color }}
                              onClick={() => applyColor(color)}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => applyColor(e.target.value)}
                            className="w-8 h-8 rounded border cursor-pointer"
                          />
                          <span className="text-sm text-muted-foreground">Custom</span>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </TooltipTrigger>
                <TooltipContent>Text Color</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Alignment */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.alignLeft ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('justifyLeft')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.alignCenter ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('justifyCenter')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.alignRight ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('justifyRight')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Lists */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.unorderedList ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('insertUnorderedList')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive.orderedList ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleCommand('insertOrderedList')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCommand('formatBlock', '<blockquote>')}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Insert */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLinkDialogOpen(true)}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setImageDialogOpen(true)}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Image</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border mx-1" />

              {/* Clear Formatting */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFormatting}
                    disabled={disabled}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear Formatting</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        {/* Editor */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable={!disabled}
            className={cn(
              "p-4 focus:outline-none overflow-auto max-h-80",
              disabled && "bg-muted cursor-not-allowed",
              "prose prose-sm max-w-none",
              "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4",
              "[&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3",
              "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2",
              "[&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
              "[&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded [&_pre]:font-mono [&_pre]:text-sm",
              "[&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80",
              "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
              "[&_img]:rounded [&_img]:shadow-sm"
            )}
            style={{
              minHeight: `${minHeight}px`,
              maxHeight: maxHeight ? `${maxHeight}px` : undefined,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            onMouseUp={updateActiveStates}
            onBlur={handleEditorBlur}
            onFocus={handleEditorFocus}
            onPaste={handlePaste}
            suppressContentEditableWarning={true}
          />
          {showPlaceholder && (
            <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none select-none">
              {placeholder}
            </div>
          )}
        </div>
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="linkUrl" className="text-sm font-medium">URL</Label>
              <Input
                id="linkUrl"
                type="url"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="linkText" className="text-sm font-medium">Link Text (optional)</Label>
              <Input
                id="linkText"
                type="text"
                placeholder="Link description"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink} disabled={!linkUrl}>
              <Check className="mr-2 h-4 w-4" /> Insert Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="imageUrl" className="text-sm font-medium">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="imageAlt" className="text-sm font-medium">Alt Text</Label>
              <Input
                id="imageAlt"
                type="text"
                placeholder="Description of the image"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              <Check className="mr-2 h-4 w-4" /> Insert Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

