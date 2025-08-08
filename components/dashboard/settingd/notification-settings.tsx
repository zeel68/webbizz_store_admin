"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save, Loader2, Bell, Mail, MessageSquare, Smartphone, Settings } from 'lucide-react'


interface NotificationSettingsProps {
    storeConfig: iStoreConfig | null
}

export function NotificationSettings({ storeConfig }: NotificationSettingsProps) {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        email_notifications: {
            new_orders: true,
            low_stock: true,
            customer_reviews: true,
            payment_received: true,
            refund_requests: false,
            system_updates: true,
        },
        sms_notifications: {
            new_orders: false,
            urgent_alerts: true,
            payment_failures: true,
        },
        push_notifications: {
            new_orders: true,
            customer_messages: true,
            inventory_alerts: true,
        },
        email_settings: {
            from_name: "Your Store",
            from_email: "noreply@yourstore.com",
            reply_to: "support@yourstore.com",
            smtp_host: "",
            smtp_port: 587,
            smtp_username: "",
            smtp_password: "",
            smtp_encryption: "tls",
        },
        notification_frequency: "immediate", // immediate, hourly, daily
        quiet_hours: {
            enabled: false,
            start_time: "22:00",
            end_time: "08:00",
        },
    })

    const handleSaveSettings = async () => {
        setLoading(true)
        try {
            // Here you would typically save to your backend
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
            toast.success("Notification settings saved successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to save notification settings")
        } finally {
            setLoading(false)
        }
    }

    const handleTestEmail = async () => {
        setLoading(true)
        try {
            // Here you would send a test email
            await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
            toast.success("Test email sent successfully")
        } catch (error: any) {
            toast.error("Failed to send test email")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>New Orders</Label>
                                <p className="text-xs text-muted-foreground">Get notified of new orders</p>
                            </div>
                            <Switch
                                checked={settings.email_notifications.new_orders}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    email_notifications: {
                                        ...prev.email_notifications,
                                        new_orders: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Low Stock Alerts</Label>
                                <p className="text-xs text-muted-foreground">When inventory is running low</p>
                            </div>
                            <Switch
                                checked={settings.email_notifications.low_stock}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    email_notifications: {
                                        ...prev.email_notifications,
                                        low_stock: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Customer Reviews</Label>
                                <p className="text-xs text-muted-foreground">New product reviews</p>
                            </div>
                            <Switch
                                checked={settings.email_notifications.customer_reviews}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    email_notifications: {
                                        ...prev.email_notifications,
                                        customer_reviews: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Payment Received</Label>
                                <p className="text-xs text-muted-foreground">Successful payments</p>
                            </div>
                            <Switch
                                checked={settings.email_notifications.payment_received}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    email_notifications: {
                                        ...prev.email_notifications,
                                        payment_received: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Refund Requests</Label>
                                <p className="text-xs text-muted-foreground">Customer refund requests</p>
                            </div>
                            <Switch
                                checked={settings.email_notifications.refund_requests}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    email_notifications: {
                                        ...prev.email_notifications,
                                        refund_requests: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>System Updates</Label>
                                <p className="text-xs text-muted-foreground">Platform updates and maintenance</p>
                            </div>
                            <Switch
                                checked={settings.email_notifications.system_updates}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    email_notifications: {
                                        ...prev.email_notifications,
                                        system_updates: checked
                                    }
                                }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        SMS Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>New Orders</Label>
                                <p className="text-xs text-muted-foreground">SMS for new orders</p>
                            </div>
                            <Switch
                                checked={settings.sms_notifications.new_orders}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    sms_notifications: {
                                        ...prev.sms_notifications,
                                        new_orders: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Urgent Alerts</Label>
                                <p className="text-xs text-muted-foreground">Critical system alerts</p>
                            </div>
                            <Switch
                                checked={settings.sms_notifications.urgent_alerts}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    sms_notifications: {
                                        ...prev.sms_notifications,
                                        urgent_alerts: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Payment Failures</Label>
                                <p className="text-xs text-muted-foreground">Failed payment attempts</p>
                            </div>
                            <Switch
                                checked={settings.sms_notifications.payment_failures}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    sms_notifications: {
                                        ...prev.sms_notifications,
                                        payment_failures: checked
                                    }
                                }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Push Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>New Orders</Label>
                                <p className="text-xs text-muted-foreground">Browser push notifications</p>
                            </div>
                            <Switch
                                checked={settings.push_notifications.new_orders}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    push_notifications: {
                                        ...prev.push_notifications,
                                        new_orders: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Customer Messages</Label>
                                <p className="text-xs text-muted-foreground">New customer inquiries</p>
                            </div>
                            <Switch
                                checked={settings.push_notifications.customer_messages}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    push_notifications: {
                                        ...prev.push_notifications,
                                        customer_messages: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Inventory Alerts</Label>
                                <p className="text-xs text-muted-foreground">Stock level warnings</p>
                            </div>
                            <Switch
                                checked={settings.push_notifications.inventory_alerts}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    push_notifications: {
                                        ...prev.push_notifications,
                                        inventory_alerts: checked
                                    }
                                }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Email Configuration
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="from_name">From Name</Label>
                            <Input
                                id="from_name"
                                value={settings.email_settings.from_name}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        from_name: e.target.value
                                    }
                                }))}
                                placeholder="Your Store Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="from_email">From Email</Label>
                            <Input
                                id="from_email"
                                type="email"
                                value={settings.email_settings.from_email}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        from_email: e.target.value
                                    }
                                }))}
                                placeholder="noreply@yourstore.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="reply_to">Reply To Email</Label>
                            <Input
                                id="reply_to"
                                type="email"
                                value={settings.email_settings.reply_to}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        reply_to: e.target.value
                                    }
                                }))}
                                placeholder="support@yourstore.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_host">SMTP Host</Label>
                            <Input
                                id="smtp_host"
                                value={settings.email_settings.smtp_host}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        smtp_host: e.target.value
                                    }
                                }))}
                                placeholder="smtp.gmail.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_port">SMTP Port</Label>
                            <Input
                                id="smtp_port"
                                type="number"
                                value={settings.email_settings.smtp_port}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        smtp_port: Number(e.target.value)
                                    }
                                }))}
                                placeholder="587"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_encryption">Encryption</Label>
                            <Select
                                value={settings.email_settings.smtp_encryption}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        smtp_encryption: value
                                    }
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    <SelectItem value="tls">TLS</SelectItem>
                                    <SelectItem value="ssl">SSL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_username">SMTP Username</Label>
                            <Input
                                id="smtp_username"
                                value={settings.email_settings.smtp_username}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        smtp_username: e.target.value
                                    }
                                }))}
                                placeholder="your-email@gmail.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="smtp_password">SMTP Password</Label>
                            <Input
                                id="smtp_password"
                                type="password"
                                value={settings.email_settings.smtp_password}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    email_settings: {
                                        ...prev.email_settings,
                                        smtp_password: e.target.value
                                    }
                                }))}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleTestEmail} variant="outline" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Send Test Email
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Notification Preferences
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="frequency">Notification Frequency</Label>
                            <Select
                                value={settings.notification_frequency}
                                onValueChange={(value) => setSettings(prev => ({
                                    ...prev,
                                    notification_frequency: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="immediate">Immediate</SelectItem>
                                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                                    <SelectItem value="daily">Daily Digest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Enable Quiet Hours</Label>
                                <Switch
                                    checked={settings.quiet_hours.enabled}
                                    onCheckedChange={(checked) => setSettings(prev => ({
                                        ...prev,
                                        quiet_hours: {
                                            ...prev.quiet_hours,
                                            enabled: checked
                                        }
                                    }))}
                                />
                            </div>
                            {settings.quiet_hours.enabled && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Start Time</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={settings.quiet_hours.start_time}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                quiet_hours: {
                                                    ...prev.quiet_hours,
                                                    start_time: e.target.value
                                                }
                                            }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">End Time</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={settings.quiet_hours.end_time}
                                            onChange={(e) => setSettings(prev => ({
                                                ...prev,
                                                quiet_hours: {
                                                    ...prev.quiet_hours,
                                                    end_time: e.target.value
                                                }
                                            }))}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save Notification Settings
                </Button>
            </div>
        </div>
    )
}
