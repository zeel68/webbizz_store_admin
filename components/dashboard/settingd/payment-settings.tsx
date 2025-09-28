"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Save, Loader2, CreditCard, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { useStoreConfigStore } from "@/store/storeConfigStore"


interface PaymentSettingsProps {
    storeConfig: iStoreConfig | null
}

interface PaymentMethod {
    id: string
    name: string
    type: string
    enabled: boolean
    config: Record<string, any>
}

const availablePaymentMethods = [
    {
        id: "stripe",
        name: "Stripe",
        type: "card",
        description: "Accept credit and debit cards",
        icon: "💳",
        fields: [
            { key: "publishable_key", label: "Publishable Key", type: "text", required: true },
            { key: "secret_key", label: "Secret Key", type: "password", required: true },
        ]
    },
    {
        id: "paypal",
        name: "PayPal",
        type: "wallet",
        description: "PayPal payments",
        icon: "🅿️",
        fields: [
            { key: "client_id", label: "Client ID", type: "text", required: true },
            { key: "client_secret", label: "Client Secret", type: "password", required: true },
            { key: "sandbox", label: "Sandbox Mode", type: "boolean", required: false },
        ]
    },
    {
        id: "bank_transfer",
        name: "Bank Transfer",
        type: "bank",
        description: "Direct bank transfers",
        icon: "🏦",
        fields: [
            { key: "account_name", label: "Account Name", type: "text", required: true },
            { key: "account_number", label: "Account Number", type: "text", required: true },
            { key: "routing_number", label: "Routing Number", type: "text", required: true },
            { key: "bank_name", label: "Bank Name", type: "text", required: true },
        ]
    },
    {
        id: "cash_on_delivery",
        name: "Cash on Delivery",
        type: "cod",
        description: "Pay when you receive",
        icon: "💵",
        fields: [
            { key: "extra_fee", label: "Extra Fee", type: "number", required: false },
            { key: "max_amount", label: "Maximum Order Amount", type: "number", required: false },
        ]
    },
]

export function PaymentSettings({ storeConfig }: PaymentSettingsProps) {
    const { updateStoreConfig, loading } = useStoreConfigStore()

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
    const [selectedMethodType, setSelectedMethodType] = useState<string>("")
    const [methodConfig, setMethodConfig] = useState<Record<string, any>>({})

    useEffect(() => {
        if (storeConfig?.payment_methods) {
            // Convert string array to PaymentMethod objects
            const methods = storeConfig.payment_methods?.map((methodId: any, index: number) => {
                const methodInfo = availablePaymentMethods.find(m => m.id === methodId)
                return {
                    id: methodId,
                    name: methodInfo?.name || methodId,
                    type: methodInfo?.type || "unknown",
                    enabled: true,
                    config: {}
                }
            })
            setPaymentMethods(methods)
        }
    }, [storeConfig])

    const handleOpenDialog = (method?: PaymentMethod) => {
        if (method) {
            setEditingMethod(method)
            setSelectedMethodType(method.id)
            setMethodConfig(method.config || {})
        } else {
            setEditingMethod(null)
            setSelectedMethodType("")
            setMethodConfig({})
        }
        setIsDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setIsDialogOpen(false)
        setEditingMethod(null)
        setSelectedMethodType("")
        setMethodConfig({})
    }

    const handleSaveMethod = () => {
        if (!selectedMethodType) {
            toast.error("Please select a payment method")
            return
        }

        const methodInfo = availablePaymentMethods.find(m => m.id === selectedMethodType)
        if (!methodInfo) return

        // Validate required fields
        const requiredFields = methodInfo.fields.filter(f => f.required)
        for (const field of requiredFields) {
            if (!methodConfig[field.key]) {
                toast.error(`${field.label} is required`)
                return
            }
        }

        const newMethod: PaymentMethod = {
            id: selectedMethodType,
            name: methodInfo.name,
            type: methodInfo.type,
            enabled: true,
            config: methodConfig
        }

        if (editingMethod) {
            setPaymentMethods(prev => prev.map(m => m.id === editingMethod.id ? newMethod : m))
            toast.success("Payment method updated")
        } else {
            if (paymentMethods.some(m => m.id === selectedMethodType)) {
                toast.error("Payment method already exists")
                return
            }
            setPaymentMethods(prev => [...prev, newMethod])
            toast.success("Payment method added")
        }

        handleCloseDialog()
    }

    const handleDeleteMethod = (methodId: string) => {
        if (confirm("Are you sure you want to remove this payment method?")) {
            setPaymentMethods(prev => prev.filter(m => m.id !== methodId))
            toast.success("Payment method removed")
        }
    }

    const handleToggleMethod = (methodId: string) => {
        setPaymentMethods(prev => prev.map(m =>
            m.id === methodId ? { ...m, enabled: !m.enabled } : m
        ))
    }

    const handleSaveSettings = async () => {
        try {
            const enabledMethods = paymentMethods.filter(m => m.enabled).map(m => m.id)

            const formData = new FormData()
            formData.append('payment_methods', JSON.stringify(enabledMethods))

            await updateStoreConfig(formData as any)
            toast.success("Payment settings saved successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to save payment settings")
        }
    }

    const selectedMethodInfo = availablePaymentMethods.find(m => m.id === selectedMethodType)

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Methods
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Configure payment methods for your store
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Payment Method
                        </Button>
                    </div>

                    {paymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No payment methods configured</p>
                            <Button onClick={() => handleOpenDialog()} className="mt-4">
                                Add Your First Payment Method
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paymentMethods.map((method) => {
                                const methodInfo = availablePaymentMethods.find(m => m.id === method.id)
                                return (
                                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{methodInfo?.icon}</span>
                                            <div>
                                                <h4 className="font-medium">{method.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {methodInfo?.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={method.enabled ? "default" : "secondary"}>
                                                {method.enabled ? "Enabled" : "Disabled"}
                                            </Badge>
                                            <Switch
                                                checked={method.enabled}
                                                onCheckedChange={() => handleToggleMethod(method.id)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenDialog(method)}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteMethod(method.id)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Tax Settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                            <Input
                                id="tax_rate"
                                type="number"
                                step="0.01"

                                max="100"
                                defaultValue={storeConfig?.tax_settings?.tax_rate || 0}
                                placeholder="8.25"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                            <Switch
                                id="tax_inclusive"
                                defaultChecked={storeConfig?.tax_settings?.tax_inclusive || false}
                            />
                            <Label htmlFor="tax_inclusive">Tax Inclusive Pricing</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save Payment Settings
                </Button>
            </div>

            {/* Payment Method Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {!editingMethod && (
                            <div className="space-y-2">
                                <Label>Select Payment Method</Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {availablePaymentMethods
                                        .filter(method => !paymentMethods.some(m => m.id === method.id))
                                        .map((method) => (
                                            <div
                                                key={method.id}
                                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedMethodType === method.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-muted hover:border-primary/50"
                                                    }`}
                                                onClick={() => setSelectedMethodType(method.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl">{method.icon}</span>
                                                    <div>
                                                        <h4 className="font-medium">{method.name}</h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {method.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {selectedMethodInfo && (
                            <div className="space-y-4">
                                <h4 className="font-medium">Configure {selectedMethodInfo.name}</h4>
                                {selectedMethodInfo.fields.map((field) => (
                                    <div key={field.key} className="space-y-2">
                                        <Label htmlFor={field.key}>
                                            {field.label}
                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                        </Label>
                                        {field.type === "boolean" ? (
                                            <Switch
                                                id={field.key}
                                                checked={methodConfig[field.key] || false}
                                                onCheckedChange={(checked) =>
                                                    setMethodConfig(prev => ({ ...prev, [field.key]: checked }))
                                                }
                                            />
                                        ) : (
                                            <Input
                                                id={field.key}
                                                type={field.type}
                                                value={methodConfig[field.key] || ""}
                                                onChange={(e) =>
                                                    setMethodConfig(prev => ({ ...prev, [field.key]: e.target.value }))
                                                }
                                                placeholder={`Enter ${field.label.toLowerCase()}`}
                                                required={field.required}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveMethod} disabled={!selectedMethodType}>
                                {editingMethod ? "Update" : "Add"} Method
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
