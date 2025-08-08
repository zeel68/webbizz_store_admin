"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Save, Loader2, Palette, Type, Layout } from 'lucide-react'
import { useStoreConfigStore } from "@/store/storeConfigStore"

interface ThemeSettingsProps {
    storeConfig: iStoreConfig | null
}

interface ThemeFormData {
    primary_color: string
    secondary_color: string
    font_family: string
    layout: string
}

const colorPresets = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Red", value: "#ef4444" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Teal", value: "#14b8a6" },
]

const fontOptions = [
    { name: "Inter", value: "Inter, sans-serif" },
    { name: "Roboto", value: "Roboto, sans-serif" },
    { name: "Open Sans", value: "Open Sans, sans-serif" },
    { name: "Lato", value: "Lato, sans-serif" },
    { name: "Montserrat", value: "Montserrat, sans-serif" },
    { name: "Poppins", value: "Poppins, sans-serif" },
    { name: "Source Sans Pro", value: "Source Sans Pro, sans-serif" },
    { name: "Nunito", value: "Nunito, sans-serif" },
]

const layoutOptions = [
    { name: "Modern", value: "modern", description: "Clean and minimal design" },
    { name: "Classic", value: "classic", description: "Traditional e-commerce layout" },
    { name: "Compact", value: "compact", description: "Space-efficient design" },
    { name: "Wide", value: "wide", description: "Full-width layout" },
]

export function ThemeSettings({ storeConfig }: ThemeSettingsProps) {
    const { loading } = useStoreConfigStore()

    const form = useForm<ThemeFormData>({
        defaultValues: {
            primary_color: "#3b82f6",
            secondary_color: "#64748b",
            font_family: "Inter, sans-serif",
            layout: "modern",
        },
    })

    useEffect(() => {
        if (storeConfig?.theme_settings) {
            form.reset({
                primary_color: storeConfig.theme_settings.primary_color || "#3b82f6",
                secondary_color: storeConfig.theme_settings.secondary_color || "#64748b",
                font_family: storeConfig.theme_settings.font_family || "Inter, sans-serif",
                layout: storeConfig.theme_settings.layout || "modern",
            })
        }
    }, [storeConfig, form])

    const onSubmit = async (data: ThemeFormData) => {
        try {
            // await updateStoreTheme(data)
            toast.success("Theme settings updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update theme settings")
        }
    }

    const watchedValues = form.watch()

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Color Scheme
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="primary_color">Primary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="primary_color"
                                        type="color"
                                        {...form.register("primary_color")}
                                        className="w-16 h-10 p-1 border rounded"
                                    />
                                    <Input
                                        {...form.register("primary_color")}
                                        placeholder="#3b82f6"
                                        className="flex-1"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {colorPresets.map((preset) => (
                                        <button
                                            key={preset.value}
                                            type="button"
                                            className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400 transition-colors"
                                            style={{ backgroundColor: preset.value }}
                                            onClick={() => form.setValue("primary_color", preset.value)}
                                            title={preset.name}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secondary_color">Secondary Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="secondary_color"
                                        type="color"
                                        {...form.register("secondary_color")}
                                        className="w-16 h-10 p-1 border rounded"
                                    />
                                    <Input
                                        {...form.register("secondary_color")}
                                        placeholder="#64748b"
                                        className="flex-1"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-medium mb-3">Color Preview</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-8 rounded border"
                                            style={{ backgroundColor: watchedValues.primary_color }}
                                        />
                                        <span className="text-sm">Primary Color</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-8 rounded border"
                                            style={{ backgroundColor: watchedValues.secondary_color }}
                                        />
                                        <span className="text-sm">Secondary Color</span>
                                    </div>
                                    <div className="mt-4 p-3 rounded border">
                                        <Button
                                            type="button"
                                            style={{ backgroundColor: watchedValues.primary_color }}
                                            className="text-white"
                                        >
                                            Sample Button
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Type className="h-5 w-5" />
                        Typography
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="font_family">Font Family</Label>
                        <Select
                            value={form.watch("font_family")}
                            onValueChange={(value) => form.setValue("font_family", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select font family" />
                            </SelectTrigger>
                            <SelectContent>
                                {fontOptions.map((font) => (
                                    <SelectItem key={font.value} value={font.value}>
                                        <span style={{ fontFamily: font.value }}>{font.name}</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="mt-4 p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Font Preview</h4>
                            <div style={{ fontFamily: watchedValues.font_family }}>
                                <h3 className="text-lg font-semibold mb-2">Sample Heading</h3>
                                <p className="text-sm text-muted-foreground">
                                    This is how your store text will appear with the selected font family.
                                    The quick brown fox jumps over the lazy dog.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        Layout Style
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {layoutOptions.map((layout) => (
                            <div
                                key={layout.value}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${form.watch("layout") === layout.value
                                    ? "border-primary bg-primary/5"
                                    : "border-muted hover:border-primary/50"
                                    }`}
                                onClick={() => form.setValue("layout", layout.value)}
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className={`w-4 h-4 rounded-full border-2 ${form.watch("layout") === layout.value
                                        ? "border-primary bg-primary"
                                        : "border-muted-foreground"
                                        }`} />
                                    <h4 className="font-medium">{layout.name}</h4>
                                </div>
                                <p className="text-sm text-muted-foreground">{layout.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save Theme Settings
                </Button>
            </div>
        </form>
    )
}
