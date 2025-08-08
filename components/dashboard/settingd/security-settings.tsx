"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Save, Loader2, Shield, Key, Lock, Eye, AlertTriangle } from 'lucide-react'


interface SecuritySettingsProps {
    storeConfig: iStoreConfig | null
}

export function SecuritySettings({ storeConfig }: SecuritySettingsProps) {
    const [loading, setLoading] = useState(false)
    const [settings, setSettings] = useState({
        two_factor_auth: false,
        password_policy: {
            min_length: 8,
            require_uppercase: true,
            require_lowercase: true,
            require_numbers: true,
            require_symbols: false,
        },
        session_timeout: 30,
        login_attempts: 5,
        account_lockout_duration: 15,
        ip_whitelist: [] as string[],
        ssl_required: true,
        secure_cookies: true,
        csrf_protection: true,
    })

    const [newIpAddress, setNewIpAddress] = useState("")

    const handleSaveSettings = async () => {
        setLoading(true)
        try {
            // Here you would typically save to your backend
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
            toast.success("Security settings saved successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to save security settings")
        } finally {
            setLoading(false)
        }
    }

    const handleAddIpAddress = () => {
        if (!newIpAddress.trim()) {
            toast.error("Please enter a valid IP address")
            return
        }

        const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        if (!ipRegex.test(newIpAddress.trim())) {
            toast.error("Please enter a valid IP address format")
            return
        }

        if (settings.ip_whitelist.includes(newIpAddress.trim())) {
            toast.error("IP address already exists in whitelist")
            return
        }

        setSettings(prev => ({
            ...prev,
            ip_whitelist: [...prev.ip_whitelist, newIpAddress.trim()]
        }))
        setNewIpAddress("")
        toast.success("IP address added to whitelist")
    }

    const handleRemoveIpAddress = (ip: string) => {
        setSettings(prev => ({
            ...prev,
            ip_whitelist: prev.ip_whitelist.filter(address => address !== ip)
        }))
        toast.success("IP address removed from whitelist")
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Authentication & Access
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label className="text-base font-medium">Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">
                                Require 2FA for admin accounts
                            </p>
                        </div>
                        <Switch
                            checked={settings.two_factor_auth}
                            onCheckedChange={(checked) =>
                                setSettings(prev => ({ ...prev, two_factor_auth: checked }))
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                            <Input
                                id="session_timeout"
                                type="number"
                                min="5"
                                max="480"
                                value={settings.session_timeout}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    session_timeout: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="login_attempts">Max Login Attempts</Label>
                            <Input
                                id="login_attempts"
                                type="number"
                                min="3"
                                max="10"
                                value={settings.login_attempts}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    login_attempts: Number(e.target.value)
                                }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
                            <Input
                                id="lockout_duration"
                                type="number"
                                min="5"
                                max="60"
                                value={settings.account_lockout_duration}
                                onChange={(e) => setSettings(prev => ({
                                    ...prev,
                                    account_lockout_duration: Number(e.target.value)
                                }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        Password Policy
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="min_length">Minimum Password Length</Label>
                        <Input
                            id="min_length"
                            type="number"
                            min="6"
                            max="32"
                            value={settings.password_policy.min_length}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                password_policy: {
                                    ...prev.password_policy,
                                    min_length: Number(e.target.value)
                                }
                            }))}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between">
                            <Label>Require Uppercase Letters</Label>
                            <Switch
                                checked={settings.password_policy.require_uppercase}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    password_policy: {
                                        ...prev.password_policy,
                                        require_uppercase: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Require Lowercase Letters</Label>
                            <Switch
                                checked={settings.password_policy.require_lowercase}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    password_policy: {
                                        ...prev.password_policy,
                                        require_lowercase: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Require Numbers</Label>
                            <Switch
                                checked={settings.password_policy.require_numbers}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    password_policy: {
                                        ...prev.password_policy,
                                        require_numbers: checked
                                    }
                                }))}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>Require Symbols</Label>
                            <Switch
                                checked={settings.password_policy.require_symbols}
                                onCheckedChange={(checked) => setSettings(prev => ({
                                    ...prev,
                                    password_policy: {
                                        ...prev.password_policy,
                                        require_symbols: checked
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
                        <Lock className="h-5 w-5" />
                        Security Features
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>SSL Required</Label>
                                <p className="text-xs text-muted-foreground">Force HTTPS connections</p>
                            </div>
                            <Switch
                                checked={settings.ssl_required}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, ssl_required: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Secure Cookies</Label>
                                <p className="text-xs text-muted-foreground">Use secure cookie flags</p>
                            </div>
                            <Switch
                                checked={settings.secure_cookies}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, secure_cookies: checked }))
                                }
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>CSRF Protection</Label>
                                <p className="text-xs text-muted-foreground">Prevent cross-site attacks</p>
                            </div>
                            <Switch
                                checked={settings.csrf_protection}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({ ...prev, csrf_protection: checked }))
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5" />
                        IP Whitelist
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Input
                            value={newIpAddress}
                            onChange={(e) => setNewIpAddress(e.target.value)}
                            placeholder="Enter IP address (e.g., 192.168.1.1)"
                            className="flex-1"
                        />
                        <Button onClick={handleAddIpAddress}>Add IP</Button>
                    </div>

                    {settings.ip_whitelist.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm">Whitelisted IP Addresses</Label>
                            <div className="space-y-2">
                                {settings.ip_whitelist.map((ip, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <span className="font-mono text-sm">{ip}</span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRemoveIpAddress(ip)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-800">Warning</p>
                            <p className="text-yellow-700">
                                Be careful when adding IP restrictions. Make sure to include your current IP address
                                to avoid being locked out of the admin panel.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <Save className="h-4 w-4" />
                    Save Security Settings
                </Button>
            </div>
        </div>
    )
}
