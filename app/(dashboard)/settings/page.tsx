"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Store, Palette, CreditCard, Truck, Shield, Bell, Globe, Loader2, RefreshCw } from 'lucide-react'
import { useStoreConfigStore } from "@/store/storeConfigStore"
import { StoreInfoSettings } from "@/components/dashboard/settingd/store-info-settings"
import { NotificationSettings } from "@/components/dashboard/settingd/notification-settings"
import { PaymentSettings } from "@/components/dashboard/settingd/payment-settings"
import { SecuritySettings } from "@/components/dashboard/settingd/security-settings"
import { SEOSettings } from "@/components/dashboard/settingd/seo-settings"
import { ShippingSettings } from "@/components/dashboard/settingd/shipping-settings"
import { ThemeSettings } from "@/components/dashboard/settingd/theme-settings"


export default function SettingsPage() {
    const {
        storeConfig,
        loading,
        error,
        fetchStoreConfig,
        clearError
    } = useStoreConfigStore()

    const [activeTab, setActiveTab] = useState("store")

    useEffect(() => {
        fetchStoreConfig()
    }, [fetchStoreConfig])

    const handleRefresh = () => {
        clearError()
        fetchStoreConfig()
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                        <Button onClick={handleRefresh} className="mt-4">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your store configuration and preferences
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ₹{loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Settings Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Store Status</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            <Badge variant="default">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Store is live
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {/* {storeConfig?.payment_methods!} */}
                            payment method
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Configured methods
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shipping Zones</CardTitle>
                        <Truck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {storeConfig?.shipping_zones?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Active zones
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Features</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {storeConfig?.features ? Object.values(storeConfig.features).filter(Boolean).length : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Enabled features
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Settings Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                    <CardDescription>
                        Manage your store settings and preferences
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-7">
                            <TabsTrigger value="store" className="flex items-center gap-2">
                                <Store className="h-4 w-4" />
                                Store
                            </TabsTrigger>
                            <TabsTrigger value="theme" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Theme
                            </TabsTrigger>
                            <TabsTrigger value="payments" className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Payments
                            </TabsTrigger>
                            <TabsTrigger value="shipping" className="flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Shipping
                            </TabsTrigger>
                            <TabsTrigger value="security" className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger value="notifications" className="flex items-center gap-2">
                                <Bell className="h-4 w-4" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger value="seo" className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                SEO
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="store">
                                <StoreInfoSettings storeConfig={storeConfig} />
                            </TabsContent>
                            <TabsContent value="theme">
                                <ThemeSettings storeConfig={storeConfig} />
                            </TabsContent>
                            <TabsContent value="payments">
                                <PaymentSettings storeConfig={storeConfig} />
                            </TabsContent>
                            <TabsContent value="shipping">
                                <ShippingSettings storeConfig={storeConfig} />
                            </TabsContent>
                            <TabsContent value="security">
                                <SecuritySettings storeConfig={storeConfig} />
                            </TabsContent>
                            <TabsContent value="notifications">
                                <NotificationSettings storeConfig={storeConfig} />
                            </TabsContent>
                            <TabsContent value="seo">
                                <SEOSettings storeConfig={storeConfig} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
