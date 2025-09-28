"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save, Loader2, Truck, Plus, Edit, Trash2, MapPin } from 'lucide-react'
import { useStoreConfigStore } from "@/store/storeConfigStore"


interface ShippingSettingsProps {
    storeConfig: iStoreConfig | null
}

interface ShippingZone {
    name: string
    countries: string[]
    rates: ShippingRate[]
}

interface ShippingRate {
    method: string
    cost: number
    estimated_days: string
}

const commonCountries = [
    "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
    "Italy", "Spain", "Netherlands", "Belgium", "Sweden", "Norway", "Denmark",
    "Japan", "South Korea", "Singapore", "India", "Brazil", "Mexico", "Argentina"
]

const shippingMethods = [
    { value: "standard", label: "Standard Shipping" },
    { value: "express", label: "Express Shipping" },
    { value: "overnight", label: "Overnight Shipping" },
    { value: "free", label: "Free Shipping" },
    { value: "pickup", label: "Local Pickup" },
]

export function ShippingSettings({ storeConfig }: ShippingSettingsProps) {
    const { updateStoreConfig, loading } = useStoreConfigStore()

    const [shippingZones, setShippingZones] = useState<ShippingZone[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
    const [editingZoneIndex, setEditingZoneIndex] = useState<number>(-1)

    const [zoneForm, setZoneForm] = useState<ShippingZone>({
        name: "",
        countries: [],
        rates: []
    })

    const [newRate, setNewRate] = useState<ShippingRate>({
        method: "",
        cost: 0,
        estimated_days: ""
    })

    useEffect(() => {
        if (storeConfig?.shipping_zones) {
            setShippingZones(storeConfig.shipping_zones as any)
        }
    }, [storeConfig])

    const handleOpenDialog = (zone?: ShippingZone, index?: number) => {
        if (zone && typeof index === 'number') {
            setEditingZone(zone)
            setEditingZoneIndex(index)
            setZoneForm({ ...zone })
        } else {
            setEditingZone(null)
            setEditingZoneIndex(-1)
            setZoneForm({
                name: "",
                countries: [],
                rates: []
            })
        }
        setNewRate({
            method: "",
            cost: 0,
            estimated_days: ""
        })
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingZone(null)
        setEditingZoneIndex(-1)
    }

    const handleAddCountry = (country: string) => {
        if (!zoneForm.countries.includes(country)) {
            setZoneForm(prev => ({
                ...prev,
                countries: [...prev.countries, country]
            }))
        }
    }

    const handleRemoveCountry = (country: string) => {
        setZoneForm(prev => ({
            ...prev,
            countries: prev.countries.filter(c => c !== country)
        }))
    }

    const handleAddRate = () => {
        if (!newRate.method || newRate.cost < 0 || !newRate.estimated_days) {
            toast.error("Please fill in all rate fields")
            return
        }

        if (zoneForm.rates.some(r => r.method === newRate.method)) {
            toast.error("Shipping method already exists in this zone")
            return
        }

        setZoneForm(prev => ({
            ...prev,
            rates: [...prev.rates, { ...newRate }]
        }))

        setNewRate({
            method: "",
            cost: 0,
            estimated_days: ""
        })
    }

    const handleRemoveRate = (index: number) => {
        setZoneForm(prev => ({
            ...prev,
            rates: prev.rates.filter((_, i) => i !== index)
        }))
    }

    const handleSaveZone = () => {
        if (!zoneForm.name.trim()) {
            toast.error("Zone name is required")
            return
        }

        if (zoneForm.countries.length === 0) {
            toast.error("Please add at least one country")
            return
        }

        if (zoneForm.rates.length === 0) {
            toast.error("Please add at least one shipping rate")
            return
        }

        if (editingZone && editingZoneIndex >= 0) {
            setShippingZones(prev => prev.map((zone, index) =>
                index === editingZoneIndex ? zoneForm : zone
            ))
            toast.success("Shipping zone updated")
        } else {
            if (shippingZones.some(zone => zone.name === zoneForm.name)) {
                toast.error("Zone name already exists")
                return
            }
            setShippingZones(prev => [...prev, zoneForm])
            toast.success("Shipping zone added")
        }

        handleCloseDialog()
    }

    const handleDeleteZone = (index: number) => {
        if (confirm("Are you sure you want to delete this shipping zone?")) {
            setShippingZones(prev => prev.filter((_, i) => i !== index))
            toast.success("Shipping zone deleted")
        }
    }

    const handleSaveSettings = async () => {
        try {
            const formData = new FormData()
            formData.append('shipping_zones', JSON.stringify(shippingZones))

            await updateStoreConfig(formData as any)
            toast.success("Shipping settings saved successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to save shipping settings")
        }
    }

    const availableCountries = commonCountries.filter(country =>
        !zoneForm.countries.includes(country)
    )

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Shipping Zones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Configure shipping zones and rates for different regions
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Shipping Zone
                        </Button>
                    </div>

                    {shippingZones.length === 0 ? (
                        <div className="text-center py-8">
                            <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No shipping zones configured</p>
                            <Button onClick={() => handleOpenDialog()} className="mt-4">
                                Add Your First Shipping Zone
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {shippingZones.map((zone, index) => (
                                <Card key={index}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{zone.name}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenDialog(zone, index)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteZone(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <h5 className="font-medium mb-2 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Countries ({zone.countries.length})
                                            </h5>
                                            <div className="flex flex-wrap gap-1">
                                                {zone.countries.map((country) => (
                                                    <Badge key={country} variant="secondary" className="text-xs">
                                                        {country}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h5 className="font-medium mb-2">Shipping Rates</h5>
                                            <div className="space-y-2">
                                                {zone.rates.map((rate, rateIndex) => (
                                                    <div key={rateIndex} className="flex items-center justify-between p-2 bg-muted rounded">
                                                        <div>
                                                            <span className="font-medium capitalize">{rate.method}</span>
                                                            <span className="text-sm text-muted-foreground ml-2">
                                                                ({rate.estimated_days})
                                                            </span>
                                                        </div>
                                                        <Badge variant="outline">
                                                            ${rate.cost.toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save Shipping Settings
                </Button>
            </div>

            {/* Shipping Zone Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingZone ? "Edit Shipping Zone" : "Add Shipping Zone"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="zone_name">Zone Name *</Label>
                            <Input
                                id="zone_name"
                                value={zoneForm.name}
                                onChange={(e) => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="e.g., North America, Europe, Asia"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label>Countries *</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm">Add Countries</Label>
                                    <Select onValueChange={handleAddCountry}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCountries.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-sm">Selected Countries ({zoneForm.countries.length})</Label>
                                    <div className="max-h-32 overflow-y-auto border rounded p-2 space-y-1">
                                        {zoneForm.countries.map((country) => (
                                            <div key={country} className="flex items-center justify-between text-sm">
                                                <span>{country}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveCountry(country)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Shipping Rates *</Label>

                            {/* Add New Rate */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Add Shipping Rate</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Shipping Method</Label>
                                            <Select
                                                value={newRate.method}
                                                onValueChange={(value) => setNewRate(prev => ({ ...prev, method: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select method" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {shippingMethods
                                                        .filter(method => !zoneForm.rates.some(r => r.method === method.value))
                                                        .map((method) => (
                                                            <SelectItem key={method.value} value={method.value}>
                                                                {method.label}
                                                            </SelectItem>
                                                        ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Cost ($)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"

                                                value={newRate.cost}
                                                onChange={(e) => setNewRate(prev => ({ ...prev, cost: Number(e.target.value) }))}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Estimated Days</Label>
                                            <Input
                                                value={newRate.estimated_days}
                                                onChange={(e) => setNewRate(prev => ({ ...prev, estimated_days: e.target.value }))}
                                                placeholder="3-5 business days"
                                            />
                                        </div>
                                    </div>
                                    <Button type="button" onClick={handleAddRate} className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Rate
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Existing Rates */}
                            {zoneForm.rates.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-sm">Current Rates ({zoneForm.rates.length})</Label>
                                    <div className="space-y-2">
                                        {zoneForm.rates.map((rate, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                                                <div>
                                                    <span className="font-medium capitalize">{rate.method}</span>
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        ${rate.cost.toFixed(2)} • {rate.estimated_days}
                                                    </span>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveRate(index)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveZone}>
                                {editingZone ? "Update" : "Add"} Zone
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
